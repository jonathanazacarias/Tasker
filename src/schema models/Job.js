const { gql } = require("apollo-server");

const typeDef = gql`
    type Job {
        id: ID!
        name: String!
        reportRecipiants: String!
        employees: [User]!
        params: []!
    }
`;