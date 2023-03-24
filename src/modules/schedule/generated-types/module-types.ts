import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace ScheduleModule {
  interface DefinedFields {
    Schedule: '_id' | 'name' | 'created_by' | 'term' | 'is_public' | 'class_IDs' | 'primary_section_IDs' | 'secondary_section_IDs' | 'custom_events';
    CustomEvent: 'start_time' | 'end_time' | 'title' | 'location' | 'description' | 'days_of_week';
    Query: 'schedulesByUser' | 'scheduleByID';
    Mutation: 'removeScheduleByID' | 'createNewSchedule' | 'editExistingSchedule' | 'setSelectedSections' | 'setSelectedClasses';
  };
  
  export type Schedule = Pick<Types.Schedule, DefinedFields['Schedule']>;
  export type CustomEvent = Pick<Types.CustomEvent, DefinedFields['CustomEvent']>;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  export type Term = Types.Term;
  
  export type ScheduleResolvers = Pick<Types.ScheduleResolvers, DefinedFields['Schedule'] | '__isTypeOf'>;
  export type CustomEventResolvers = Pick<Types.CustomEventResolvers, DefinedFields['CustomEvent'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  
  export interface Resolvers {
    Schedule?: ScheduleResolvers;
    CustomEvent?: CustomEventResolvers;
    Query?: QueryResolvers;
    Mutation?: MutationResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Schedule?: {
      '*'?: gm.Middleware[];
      _id?: gm.Middleware[];
      name?: gm.Middleware[];
      created_by?: gm.Middleware[];
      term?: gm.Middleware[];
      is_public?: gm.Middleware[];
      class_IDs?: gm.Middleware[];
      primary_section_IDs?: gm.Middleware[];
      secondary_section_IDs?: gm.Middleware[];
      custom_events?: gm.Middleware[];
    };
    CustomEvent?: {
      '*'?: gm.Middleware[];
      start_time?: gm.Middleware[];
      end_time?: gm.Middleware[];
      title?: gm.Middleware[];
      location?: gm.Middleware[];
      description?: gm.Middleware[];
      days_of_week?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      schedulesByUser?: gm.Middleware[];
      scheduleByID?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      removeScheduleByID?: gm.Middleware[];
      createNewSchedule?: gm.Middleware[];
      editExistingSchedule?: gm.Middleware[];
      setSelectedSections?: gm.Middleware[];
      setSelectedClasses?: gm.Middleware[];
    };
  };
}