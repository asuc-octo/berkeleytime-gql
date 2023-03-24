import { getSchedulesByUser, getScheduleByID, removeSchedule, createSchedule, setSections, setClasses, editSchedule } from "./controller";
import { ScheduleModule } from "./generated-types/module-types";
import { Term } from "../../generated-types/graphql";

const resolvers: ScheduleModule.Resolvers = {
  Query: {
    schedulesByUser(_parent, args: { created_by: string }) {
      return getSchedulesByUser(args.created_by);
    },
    scheduleByID(_parent, args: { id: string }) {
      return getScheduleByID(args.id);
    }
  },
  Mutation: {
    removeScheduleByID(_parent, args: {id: string}) {
      return removeSchedule(args.id);
    },
    createNewSchedule(_parent, args: {created_by: string, term: Term, schedule_name?: string | undefined | null, is_public?: boolean | undefined | null, class_IDs?: string[] | undefined | null, primary_section_IDs?: string[] | undefined | null, secondary_section_IDs?: string[] | undefined | null}) {
      return createSchedule(args.created_by, args.term, args.schedule_name, args.is_public, args.class_IDs, args.primary_section_IDs, args.secondary_section_IDs)
    },
    editExistingSchedule(_parent, args: {id: string, created_by?: string | undefined | null, term?: Term | undefined | null, schedule_name?: string | undefined | null, is_public?: boolean | undefined | null, class_IDs?: string[] | null | undefined, primary_section_IDs?: string[] | undefined | null, secondary_section_IDs?: string[] | undefined | null}) {
      return editSchedule(args.id, args.created_by, args.term, args.schedule_name, args.is_public, args.class_IDs, args.primary_section_IDs, args.secondary_section_IDs)
    },
    setSelectedSections(_parent, args: {id: string, section_IDs: string[]}) {
      return setSections(args.id, args.section_IDs)
    },
    setSelectedClasses(_parent, args: {id: string, class_IDs: string[]}) {
      return setClasses(args.id, args.class_IDs)
    }
  }
};

export default resolvers;
