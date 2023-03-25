import { CatalogItem, EnrollmentDay, Term } from "../../generated-types/graphql";
import { ClassModel } from "../../db/class";
import { getTermStartMonth, termToString } from "../../utils/term";
import { GradeModel, GradeType } from "../../db/grade";
import { getAverage } from "../grade/controller";
import { CourseModel, CourseType } from "../../db/course";
import { SectionModel, SectionHistoryModel } from "../../db/section";
import { formatClass, formatCourse, formatSection } from "./formatter";
import { getCourseKey, getCsCourseId } from "../../utils/course";
import { first, isNil } from "lodash";
import { GraphQLResolveInfo } from "graphql";
import { getChildren } from "../../utils/graphql";
import { ObjectId } from "mongodb";

function matchCsCourseId(id: any) {
    return {
        $elemMatch: {
            type: "cs-course-id",
            id,
        },
    }
}

export async function getCatalog(term: Term, info: GraphQLResolveInfo): Promise<CatalogItem[] | null> {
    const classes = await ClassModel
        .find({
            "session.term.name": termToString(term),
            "aggregateEnrollmentStatus.maxEnroll": { $gt: 0 },
        })
        .lean()

    if (classes.length === 0) {
        return null
    }

    const csCourseIds = new Set(classes.map(c => getCsCourseId(c.course as CourseType)))
    const courses = await CourseModel
        .find(
            {
                identifiers: matchCsCourseId({ $in: Array.from(csCourseIds) }),
                /* 
                    The SIS toDate is unreliable so we can only
                    filter by fromDate and then sort to find the
                    most recent course.
                */
                fromDate: { $lte: getTermStartMonth(term) },
            },
            {
                _updated: 1,
                identifiers: 1,
                title: 1,
                description: 1,
                classSubjectArea: 1,
                catalogNumber: 1
            }
        )
        .sort({
            "classSubjectArea.code": 1,
            "catalogNumber.formatted": 1,
            fromDate: -1
        })
        .lean()

    /* Map grades to course keys for easy lookup */
    const gradesMap: { [key: string]: GradeType[] } = {}
    courses.forEach(c => gradesMap[getCourseKey(c)] = [])

    const children = getChildren(info)

    if (children.includes("gradeAverage")) {
        const grades = await GradeModel.find(
            {
                /* 
                    No filters because an appropriately large filter 
                    is actually significantly slower than no filter.
                */
            },
            {
                CourseSubjectShortNm: 1,
                CourseNumber: 1,
                GradeNm: 1,
                EnrollmentCnt: 1
            }
        ).lean()
        
        for (const g of grades) {
            const key = `${g.CourseSubjectShortNm as string} ${g.CourseNumber as string}`
            if (key in gradesMap) {
                gradesMap[key].push(g)
            }
        }
    }

    const catalog: any = {}
    for (const c of courses) {
        const key = getCourseKey(c)
        const id = getCsCourseId(c)

        // skip duplicates
        if (id in catalog)
            continue

        catalog[id] = {
            ...formatCourse(c, term),
            classes: [],
            gradeAverage: await getAverage(gradesMap[key]),
        }
    }

    for (const c of classes) {
        const id = getCsCourseId(c.course as CourseType)

        if (!(id in catalog)) {
            throw new Error(`Class ${c.course?.subjectArea?.code} ${c.course?.catalogNumber?.formatted}`
                + ` has a course id ${id} that doesn't exist for the ${term.semester} ${term.year} term.`)
        }
        catalog[id].classes.push(formatClass(c))
    }

    return Object.values(catalog)
}

export function getClass(subject: string, courseNumber: string, term: Term, classNumber: string) {
    return ClassModel
        .findOne({
            "course.subjectArea.code": subject,
            "course.catalogNumber.formatted": courseNumber,
            "session.term.name": termToString(term),
            "number": classNumber,
        })
        .lean()
        .then(formatClass)
}

export function getClassById(id: string, term: Term, classNumber: string) {
    return ClassModel
        .findOne({
            "course.identifiers": matchCsCourseId(id),
            "session.term.name": termToString(term),
            "number": classNumber,
        })
        .lean()
        .then(formatClass)
}

export function getPrimarySection(id: string, term: Term, classNumber: string) {
    return SectionModel
        .findOne({
            "class.course.identifiers": matchCsCourseId(id),
            "class.session.term.name": termToString(term),
            "class.number": classNumber,
            "association.primary": true
        })
        .lean()
        .then(formatSection)
}

export function getClassSections(id: string, term: Term, classNumber: string) {
    return SectionModel
        .find({
            "class.course.identifiers": matchCsCourseId(id),
            "class.session.term.name": termToString(term),
            "class.number": classNumber
        })
        .lean()
        .then(s => s.map(formatSection))
}

export function getCourse(subject: string, courseNumber: string, term?: Term | null) {
    const filter: any = {
        "classSubjectArea.code": subject,
        "catalogNumber.formatted": courseNumber
    }

    if (!isNil(term)) {
        filter.fromDate = { $lte: getTermStartMonth(term) }
    }

    return CourseModel
        .findOne(filter)
        .sort({ fromDate: -1 })
        .lean()
        .then(c => formatCourse(c, term))
}

export function getCourseById(id: string, term?: Term | null) {
    const filter: any = {
        identifiers: matchCsCourseId(id)
    }

    if (!isNil(term)) {
        filter.fromDate = { $lte: getTermStartMonth(term) }
    }

    return CourseModel
        .findOne(filter)
        .sort({ fromDate: -1 })
        .lean()
        .then(c => formatCourse(c, term))
}

export function getCourseClasses(id: string, term?: Term | null) {
    const filter: any = {
        "course.identifiers": matchCsCourseId(id)
    }

    if (!isNil(term)) {
        filter["session.term.name"] = termToString(term)
    }

    return ClassModel
        .find(filter)
        .lean()
        .then(c => c.map(formatClass))
}

export function getCrossListings(displayNames: string[], term?: Term | null) {
    return displayNames.map(name => {
        const filter: any = {
            displayName: name
        }

        if (!isNil(term)) {
            filter.fromDate = { $lte: getTermStartMonth(term) }
        }

        return CourseModel
            .findOne(filter)
            .sort({ fromDate: -1 })
            .lean()
            .then(c => formatCourse(c, term))
    })
}

export function getSection(subject: string, courseNumber: string, term: Term, classNumber: string, sectionNumber: string) {
    return SectionModel
        .findOne({
            "class.course.subjectArea.code": subject,
            "class.course.catalogNumber.formatted": courseNumber,
            "class.session.term.name": termToString(term),
            "class.number": classNumber,
            "number": sectionNumber
        })
        .lean()
        .then(formatSection)
}

export function getSectionById(id: string, term: Term, classNumber: string, sectionNumber: string) {
    return SectionModel
        .findOne({
            "class.course.identifiers": matchCsCourseId(id),
            "class.session.term.name": termToString(term),
            "class.number": classNumber,
            "number": sectionNumber
        })
        .lean()
        .then(formatSection)
}

export function getCourseList(): any {
    return CourseModel.aggregate()
        .group({ _id: { subject: "$classSubjectArea.code", number: "$catalogNumber.formatted" } })
        .sort({ "_id.subject": 1, "_id.number": 1 })
        .project({ _id: 0, subject: "$_id.subject", number: "$_id.number" })
}

export async function getEnrollment(ccn: number, term: Term) {
    const section = await SectionModel.findOne({"id": ccn, "class.session.term.name": termToString(term)}).lean()
    const sectionObjectId = section?._id.toString()

    // no idea why but the {$exists: true} part just does not work. If $exists works eventually, we should update the code to use it
    // const diffs = await SectionHistoryModel.find({collectionId: new ObjectId(sectionObjectId), "diff.enrollmentStatus.enrolledCount": {$exists: true}}).lean()

    const diffs = await SectionHistoryModel.find({collectionId: new ObjectId(sectionObjectId)}).lean()

    const enrollmentHistory = new Array<EnrollmentDay>

    // temp var; see comments below
    var needFirst = true
    
    var firstDay = new Date

    var maxEnroll = 0
    var maxWaitlist = 0
    
    // just grabs the maxEnroll and maxWaitlist to match the current frontend functionality
    // this means maxEnroll or maxWaitlist don't reflect changes over time, instead just serves the all-time max for graphing purposes
    diffs.map((diff) => {
        if ("enrollmentStatus" in diff.diff) {
            if ("maxEnroll" in diff.diff.enrollmentStatus) {
                maxEnroll = diff.diff.enrollmentStatus.maxEnroll[1]
            }
            
            if ("maxWaitlist" in diff.diff.enrollmentStatus) {
                maxWaitlist = diff.diff.enrollmentStatus.maxWaitlist[1]
            }
            
            // really REALLY inefficient code for quickly grabbing a "first day of enrollment" to work with
            // will re-work once we integrate term start days
            if (("enrolledCount" in diff.diff.enrollmentStatus || "waitlistedCount" in diff.diff.enrollmentStatus) && needFirst) {
                firstDay = new Date(diff.createdAt)
                // this can be quite finicky; sometimes you get a proper 0 enrollment / 0 waitlist / 0 time elapsed term
                // sometimes it skips straight to 1 time elapsed
                // not sure if it's strictly this part, or
                firstDay.setDate(firstDay.getDate() - 1)
                needFirst = false
            }
        }
    })
    
    var prevEnrollCount = 0
    var prevWaitlistCount = 0

    var prevDay = firstDay

    console.log(prevDay)

    // interpolates missing dates to allow frontend graphing to functin properly
    function fillGaps(currDay: Date, prevDay: Date, prevEnrollCount: number, prevWaitlistCount: number) {
        let dayGap = daysElapsed(currDay, prevDay)

        console.log("dg", dayGap)
        let startingDE = daysElapsed(prevDay, firstDay)
        console.log("sde", startingDE)
        for (let i = 1; i < dayGap; i++) {

            // current frontend implementation would just push mostly nulls here, but I elected to extrapolate from previous data
            enrollmentHistory.push({
                daysElapsed: startingDE + i,
                enrollCount: prevEnrollCount, 
                enrollMax: maxEnroll, 
                waitlistCount: prevWaitlistCount,
                waitlistMax: maxWaitlist
            })
        }

    }

    // helper function to get the number of days that separate currDay and prevDay
    function daysElapsed(currDay: Date, prevDay: Date): number {
        return Math.round((currDay.getTime() - prevDay.getTime()) / (1000 * 60 * 60 * 24))
    }

    diffs.map((diff) => {
        if ("enrollmentStatus" in diff.diff) {
            
            if ("enrolledCount" in diff.diff.enrollmentStatus) {
                fillGaps(new Date(diff.createdAt), prevDay, prevEnrollCount, prevWaitlistCount)

                prevEnrollCount = diff.diff.enrollmentStatus.enrolledCount[1]
                prevDay = new Date(diff.createdAt)
            }
            if ("waitlistedCount" in diff.diff.enrollmentStatus) {
                fillGaps(new Date(diff.createdAt), prevDay, prevEnrollCount, prevWaitlistCount)

                prevWaitlistCount = diff.diff.enrollmentStatus.waitlistedCount[1]
                prevDay = new Date(diff.createdAt)
            }

            enrollmentHistory.push({
                daysElapsed: daysElapsed(prevDay, firstDay), 
                enrollCount: prevEnrollCount, 
                enrollMax: maxEnroll, 
                waitlistCount: prevWaitlistCount,
                waitlistMax: maxWaitlist
            })
        }
    })
    
    return enrollmentHistory
}
