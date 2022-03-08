import { gql } from "apollo-server";

export const typeDef = gql`
  type User {
    id: ID!
    name: FullName!
    email: String!
    company: Company!
    roles: [Role]!
    avatar: String
    bio: String
    phone: String
    assignedJobs: [Job]!
    address: Address
    schedual: Schedule
    signUpDate: String!
    lastModDate: String!
  }

  input FullName {
      firstName: String!
      middleName: String
      lastName: String!
  }

  type AuthUser {
    user: User!
    token: String!
  }
`;

export const resolvers = {
  User: {
    id: ({ _id, id }) => _id || id,
  },

  Mutation: {
    
  }

};