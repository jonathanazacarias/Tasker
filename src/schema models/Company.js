const { gql } = require("apollo-server");

const typeDef = gql`
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

const resolvers = {
  Company: {
    id: ({ _id, id }) => _id || id,
  },

  Mutation: {
    createCompany: async (_, { input }, { db, user }) => {
      //make sure user is authenticated
      if (!user) {
        throw new Error('Authentication Error. Please Sign In.')
      }

      const newCompany = {
        name: input.name,
      }

      const result = await db.collection('Companies').insertOne(newCompany);
      const someId = result.insertedId;
      const company = await db.collection('Companies').findOne({ _id: someId });

      return {
        id: someId,
        name: company.name
      }

    }
  }

};