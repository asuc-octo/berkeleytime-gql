import { CatalogItem, Term } from "../../generated-types/graphql";
import { ClassModel } from "../../db/class";
import { termToString } from "../../utils/term";
import { GradeModel } from "../../db/grade";
import { getAverage } from "../grade/controller";

export async function getCatalog(term: Term): Promise<CatalogItem[]> {
    const classes = await ClassModel.find({
        "session.term.name": termToString(term),
        "aggregateEnrollmentStatus.maxEnroll": { $gt: 0 },
    }).lean()

    const grades = await GradeModel.find({}, { CourseSubjectShortNm: 1, CourseNumber: 1, GradeNm: 1, EnrollmentCnt: 1 }).lean()

    const courseToKey = (c: any) => `${c.subjectArea?.description as string} ${c.catalogNumber?.formatted as string}`

    let gradesMap = {}
    // @ts-ignore
    classes.forEach(c => { gradesMap[courseToKey(c.course)] = [] })

    grades.forEach(g => {
        const key = `${g.CourseSubjectShortNm as string} ${g.CourseNumber as string}`
        if (key in gradesMap) {
            // @ts-ignore
            gradesMap[key].push(g)
        }
    })
    
    let catalog = {}

    for (const c of classes) {
        const key = courseToKey(c.course)
        if (!(key in catalog)) {
            // @ts-ignore
            catalog[key] = {
                subject: c.course?.subjectArea?.code as string,
                courseNum: c.course?.catalogNumber?.formatted as string,
                courseTitle: c.course?.title as string,
                classes: [],
                // @ts-ignore
                gradeAverage: await getAverage(gradesMap[key]),
            }
        }
        // @ts-ignore
        catalog[key].classes.push({
            classNum: c.number as string,
            classTitle: c.classTitle,
            enrolledCount: c.aggregateEnrollmentStatus?.enrolledCount as number,
            maxEnrollment: c.aggregateEnrollmentStatus?.maxEnroll as number,
            minUnits: c.allowedUnits?.minimum as number,
            maxUnits: c.allowedUnits?.maximum as number,
        })
    }

    return Object.values(catalog)
}