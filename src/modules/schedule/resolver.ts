import { getSchedulesByUser, getScheduleByTermAndUser, removeSchedule, createSchedule, setSections } from "./controller";
import { ScheduleModule } from "./generated-types/module-types";

const resolvers: ScheduleModule.Resolvers = {
  Query: {
    schedulesByUser(_parent, args: { created_by: string }) {
      return getSchedulesByUser(args.created_by);
    },
    schedulesByUserAndTerm(_parent, args: { created_by: string, term: string }) {
      return getScheduleByTermAndUser(args.created_by, args.term);
    }
  },
  Mutation: {
    removeScheduleByID(_parent, args: {id: string}) {
      return removeSchedule(args.id);
    },
    // consider returning ID instead of Schedule
    // make arrays optional
    // include CustomEvent array?
    createNewSchedule(_parent, args: {created_by: string, term: string, schedule_name?: string | undefined | null, is_public?: boolean | undefined | null, class_IDs: string[] | null | undefined, section_IDs: string[] | undefined | null}) {
      
      return createSchedule(args.created_by, args.term, args.schedule_name ?? "", args.is_public ?? false, args.class_IDs ?? [""], args.section_IDs ?? [""])
      
    },
    setSelectedSections(_parent, args: {id: string, section_IDs: string[]}) {
      return setSections(args.id, args.section_IDs)
    }
  }
};

export default resolvers;
