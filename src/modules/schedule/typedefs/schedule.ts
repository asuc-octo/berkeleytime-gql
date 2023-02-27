import { gql } from "graphql-tag";

const typedef = gql`
  type Schedule {
    name: String
    created_by: String!
    date_created: String!
    last_updated: String!
    term: String!
    public: Boolean!
    class_IDs: [String]
    section_IDs: [String]
    custom_events: [CustomEvent]
  }

  type CustomEvent {
    start_time: String!
    end_time: String!
    title: String
    location: String
    description: String
    days_of_week: String
  }

  type Query {
    schedulesByUser(created_by: String!): [Schedule]
    schedulesByUserAndTerm(created_by: String!, term: String!): Schedule
  }

  type Mutation {
    removeScheduleByID(id: ID!): ID
    createNewSchedule(created_by: String!, term: String!, schedule_name: String, is_public: Boolean): Schedule
  }
`;

export default typedef;