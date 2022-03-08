const { gql } = require("apollo-server");

const typeDef = gql`
    type Address {
        street: String!
        city: String!
        state: String!
        zip: String!
    }
`;