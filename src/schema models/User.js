const { gql } = require("apollo-server");

const typeDef = gql`
    type User {
        id: ID!
        firstName: String!
        middleName: String
        lastName: String!
        email: String!
        company: Company
        roles: [Role]
        avatar: String
        bio: String
        phone: String
        assignedJobs: [Job]
        address: Address
        schedual: String
        signUpDate: String!
        lastModDate: String!
    }

    input UpdateUserInput {
        firstName: String
        middleName: String
        lastName: String
        avatar: String
        bio: String
        phone: String
        address: AddressInput
        schedual: String
        lastModDate: String!
    }

    type Mutation {
        updateUser(input: UpdateUserInput!): User!
    }
`

const resolvers = {
    User: {
        id: ({ _id, id }) => _id || id,
    },

    Mutation: {
        updateUser: async (_, { input }, { db, user }) => {

            const result = await db.collection('Users').updateOne({ _id: input.id },

            );
            const someId = result.upsertedID;
            const updatedUser = await db.collection('Users').findOne({ _id: someId });

            return {
                id: someId,
                firstName: updatedUser.firstName,
                middleName: updatedUser.middleName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                company: Company,
                roles: [Role],
                avatar: updatedUser.avatar,
                bio: updatedUser.bio,
                phone: updatedUser.phone,
                assignedJobs: [Job],
                address: Address,
                schedual: updatedUser.schedual,
                signUpDate: updatedUser.signUpDate,
                lastModDate: updatedUser.lastModDate
            }
        },

    },

}