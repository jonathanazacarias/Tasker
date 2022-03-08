const { gql } = require("apollo-server");

const typeDef = gql`
    type Report {
        id: ID!
        jobId: ID!
        jobDateTime: String!
        completionPercent: Int!
        complete: Boolean!
    }
`;