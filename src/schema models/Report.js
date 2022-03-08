import { gql } from "apollo-server";

export const typeDef = gql`
    type Report {
        id: ID!
        jobId: ID!
        jobDateTime: String!
        completionPercent: Int!
        complete: Boolean!
    }
`;