import { gql } from "apollo-server";

export const typeDef = gql`
    type Address {
        street: String!
        city: String!
        state: String!
        zip: String!
    }
`;