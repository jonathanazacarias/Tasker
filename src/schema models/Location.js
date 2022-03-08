import { gql } from "apollo-server";

export const typeDef = gql`
    type Location {
        id: ID!
        name: String!
        jobs: [Job]!
        employees: [Users]!
        address: Address
        jobParams: []!
        schedule: []!
    }
`;