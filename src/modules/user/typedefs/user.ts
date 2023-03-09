import { gql } from "graphql-tag";

const typedef = gql`
  type User {
    email: String!
    username: String!
    first_name: String!
    last_name: String!
    major: [String!]!
    last_login: String!
    is_staff: Boolean!
    is_active: Boolean!
    email_class_update: Boolean!
    email_grade_update: Boolean!
    email_enrollment_opening: Boolean!
    email_berkeleytime_update: Boolean!
  }

  type Query {
    User(email: String!): User
  }

  type Mutation {
    UpdateUserInfo(username: String!, first_name: String!, last_name: String!): User
    UpdateMajor(major: [String!]!): User
    UpdateEmailPreferences(email_class_update: Boolean!, email_grade_update: Boolean!, email_enrollment_opening: Boolean!, email_berkeleytime_update: Boolean!): User
  }
`;

export default typedef;
