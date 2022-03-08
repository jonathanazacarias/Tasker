import { gql } from "apollo-server";

export const typeDef = gql`
    type Job {
        id: ID!
        name: String!
        reportRecipiants: String!
        employees: [User]!
        params: []!
    }
`;