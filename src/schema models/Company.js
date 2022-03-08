import { gql } from "apollo-server";

export const typeDef = gql`
  type Company {
    id: ID!
    name: String!
    employees: [User]!
    locations: [Location]!
  }

  type Mutation {
    createCompany(input: CompanyInput!): Company!
    updateCompany(input: UpdateCompanyInput!): UpdateCompanyMutationResponse!
  }

  type UpdateCompanyMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    commpany: Company
  }

  input CompanyInput {
    name: String!
  }

  input UpdateCompanyInput {
    name: String!
  }
`;