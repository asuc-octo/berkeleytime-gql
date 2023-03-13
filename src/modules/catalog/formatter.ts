import { ClassType } from "../../db/class";
import { CourseType } from "../../db/course";
import { SectionType } from "../../db/section";
import { Term } from "../../generated-types/graphql";
import { getCsCourseId } from "../../utils/course";

export function formatMetadata(data: any) {
    return {
        lastUpdated: data._updated as Date,
        raw: data,
    }
}

export function formatClass(cls: ClassType, term: Term, sections?: SectionType[]) {
    const primarySection = sections?.find(s => s.association?.primary) as SectionType

    return {
        course: { term, csCourseId: getCsCourseId(cls.course as CourseType) },
        description: cls.classDescription,
        enrollCount: cls.aggregateEnrollmentStatus?.enrolledCount as number,
        enrollMax: cls.aggregateEnrollmentStatus?.maxEnroll as number,
        primarySection: primarySection ? { term, ccn: primarySection.id as number } : null,
        sections: sections?.map(s => ({ term, ccn: s.id as number })) ?? [],
        number: cls.number as string,
        semester: term.semester,
        session: cls.session?.name as string,
        status: cls.status?.description as string,
        title: cls.classTitle,
        unitsMax: cls.allowedUnits?.maximum as number,
        unitsMin: cls.allowedUnits?.minimum as number,
        waitlistCount: cls.aggregateEnrollmentStatus?.waitlistedCount as number,
        waitlistMax: cls.aggregateEnrollmentStatus?.maxWaitlist as number,
        year: term.year,
        ...formatMetadata(cls),
    }
}

export function formatSection(section: SectionType, term: Term) {
    /* All of the section data we have only have one meeting time so this is safe to do */
    const meeting = section.meetings != undefined ? section.meetings[0] : null;
    const instructors = meeting?.assignedInstructors?.
        filter(i => (i.printInScheduleOfClasses && i.instructor?.names != undefined)).
        map(i => {
            // Primary name has precedence over preferred name
            let nameInfo = i.instructor?.names?.find(n => n.type?.code === "PRI")
            if (nameInfo == undefined) {
                nameInfo = i.instructor?.names?.find(n => n.type?.code === "PRF")
            }

            if (nameInfo?.familyName == undefined) {
                console.log(i)
            }

            return { givenName: nameInfo?.givenName, familyName: nameInfo?.familyName }
        });

    const csCourseId = getCsCourseId(section.class?.course as CourseType);

    return {
        ccn: section.id as number,
        class: { csCourseId, term, classNumber: section.class?.number },
        course: { csCourseId, term },
        dateEnd: meeting?.endDate as string,
        dateStart: meeting?.startDate as string,
        days: meeting != null ? [
            meeting?.meetsSunday,
            meeting?.meetsMonday,
            meeting?.meetsTuesday,
            meeting?.meetsWednesday,
            meeting?.meetsThursday,
            meeting?.meetsFriday,
            meeting?.meetsSaturday
        ] as boolean[] : null,
        enrollCount: section.enrollmentStatus?.enrolledCount as number,
        enrollMax: section.enrollmentStatus?.maxEnroll as number,
        instructors,
        kind: section.component?.description as string,
        location: meeting?.location?.description,
        notes: section.sectionAttributes?.find(a => a.attribute?.code === "NOTE")?.value?.formalDescription,
        number: section.number as string,
        primary: section.association?.primary as boolean,
        timeEnd: meeting?.endTime as string,
        timeStart: meeting?.startTime as string,
        waitlistCount: section.enrollmentStatus?.waitlistedCount as number,
        waitlistMax: section.enrollmentStatus?.maxWaitlist as number,
        ...formatMetadata(section),
    }
}

export function formatCourse(course: CourseType, term: Term) {
    return {
        crossListing: course.crossListing?.courses?.map(c => ({ term, displayName: c, })),
        description: course.description as string,
        fromDate: course.fromDate as string,
        gradingBasis: course.gradingBasis?.description as string,
        level: course.academicCareer?.description as string,
        number: course.catalogNumber?.formatted as string,
        prereqs: course.preparation?.requiredText,
        subject: course.classSubjectArea?.code as string,
        subjectName: course.classSubjectArea?.description as string,
        title: course.title as string,
        toDate: course.toDate as string,
        ...formatMetadata(course),
    }
}