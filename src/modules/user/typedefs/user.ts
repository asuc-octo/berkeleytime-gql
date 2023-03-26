import { gql } from "graphql-tag";

const typedef = gql`
  directive @auth on OBJECT | FIELD_DEFINITION

  """
  User accout info.
  """
  type User {
    email: String!
    username: String!
    first_name: String!
    last_name: String!
    major: [String!]!
    last_login: String!
    date_joined: String!
    is_staff: Boolean!
    is_active: Boolean!
    email_class_update: Boolean!
    email_grade_update: Boolean!
    email_enrollment_opening: Boolean!
    email_berkeleytime_update: Boolean!
  }

  """
  User input type for mutations.
  """
  input UserInput {
    username: String
    first_name: String
    last_name: String
    major: [String!]
    email_class_update: Boolean
    email_grade_update: Boolean
    email_enrollment_opening: Boolean
    email_berkeleytime_update: Boolean
  }

  type Query {
    """
    Query for user info.
    """
    user: User @auth
  }

  type Mutation @auth {
    """
    Mutate user info.
    """
    updateUserInfo(newUserInfo: UserInput!): User

    """
    Delete user account.
    """
    deleteUser: User
  }
`;

export default typedef;
