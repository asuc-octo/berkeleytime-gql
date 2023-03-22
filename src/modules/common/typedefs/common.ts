import { gql } from "graphql-tag";

export default gql`
scalar JSON
scalar JSONObject

scalar ISODate

input Term {
    year: Int!
    semester: Semester!
}

enum Semester {
    Fall
    Spring
    Summer
}

type Query {
    ping: String!
}

enum CacheControlScope {
    PUBLIC
    PRIVATE
  }
  
  directive @cacheControl(
    maxAge: Int
    scope: CacheControlScope
    inheritMaxAge: Boolean
  ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION
`