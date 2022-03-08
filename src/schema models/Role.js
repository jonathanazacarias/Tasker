const { gql } = require("apollo-server");

const typeDef = gql`
    type Role {
        role: String!
    }
`;