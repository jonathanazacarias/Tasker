//imports
const { ApolloServer, gql } = require('apollo-server');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
//bcrypt for password encryption
const bcrypt = require('bcryptjs');
//jsonwebtoken for session token
const jwt = require('jsonwebtoken');

//require the dotenv file to get the database info
const dotenv = require('dotenv');
dotenv.config();

//database access information from .env file
const { DB_URI, DB_NAME, JWT_SECRET } = process.env;

//function to encrypt user 
const getToken = (user) => jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7 days' });
//function to get user from token
const getUserFromToken = async (token, db) => {
    //if there is no token return null
    if (!token) { return null }
    //verify user token with JWT_SECRET
    const tokenData = jwt.verify(token, JWT_SECRET);
    //if tokendata doesnt have an id then the tokens didnt match
    if (!tokenData?.id) { return null }
    //find and return the user with the matching id from the db
    return await db.collection('Users').findOne({ _id: ObjectId(tokenData.id) });
}

const typeDefs = gql`
    type User {
        id: ID!
        name: Name!
        email: String!
        company: Company
        role: RoleTypes!
        avatar: String
        bio: String
        phone: String
        assignedJobs: [Job]
        address: Address
        schedual: String
        signUpDate: String!
        lastUpdated: String!
    }

    type Name {
        first: String!
        middle: String
        last: String!
    }

    input NameInput {
        first: String!
        middle: String
        last: String!
    }

    enum RoleTypes {
        TASKER
        JOB_MANAGER
        COMPANY_MANAGER
        SYSTEM_MANAGER
    }

    input UpdateUserInput {
        id: String!
        name: NameUpdateInput
        avatar: String
        bio: String
        phone: String
        address: AddressInput
        schedual: String
        role: RoleTypes
    }

    input NameUpdateInput {
        first: String
        middle: String
        last: String
    }

    type AuthUser {
        user: User!
        token: String!
    }

    type Location {
        id: ID!
        name: String!
        jobs: [Job]!
        employees: [User]!
        address: Address
        jobParams: [String]!
        schedule: [String]!
    }

    input LocationInput {
        name: String
        address: AddressInput
        jobParams: [String]
        schedule: [String]
    }

    type Report {
        id: ID!
        jobId: ID!
        jobDateTime: String!
        completionPercent: Int!
        complete: Boolean!
    }

    type Job {
        id: ID!
        name: String!
        reportRecipiants: String!
        employees: [User]!
        params: [String]!
    }

    input JobInput {
        name: String!
        reportRecipiants: String!
        params: [String]!
    }

    type Address {
        street: String!
        city: String!
        state: String!
        zip: String!
    }

    input AddressInput {
        street: String!
        city: String!
        state: String!
        zip: String!
    }

    type Company {
        id: ID!
        name: String!
        employees: [User]!
        locations: [Location]!
    }

    input CompanyInput {
        name: String!
    }

    input UpdateCompanyInput {
        name: String
    }

    type Mutation {
        signUp(input: SignUpInput!): AuthUser!
        signIn(input: SignInInput!): AuthUser!

        updateUser(input: UpdateUserInput!): UpdateUserMutationResponse!

        createCompany(input: CompanyInput!): Company!
        updateCompany(input: UpdateCompanyInput!): UpdateCompanyMutationResponse!
    }

    type UpdateCompanyMutationResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        company: Company
    }

    type UpdateUserMutationResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        user: User
    }

    input SignUpInput {
        email: String!
        password: String!
        name: NameInput!
        phone: String!
        avatar: String
    }

    input SignInInput {
        email: String!
        password: String!
    }

    interface MutationResponse {
        code: String!
        success: Boolean!
        message: String!
    }

    # QUERY TYPES
    type Query {
        myJobs: [Job!]!
    }
`;

// Resolvers define the technique for fetching the types defined in the
// schema. 
const resolvers = {
    User: {
        id: ({ _id, id }) => _id || id,
    },

    Company: {
        id: ({ _id, id }) => _id || id,
    },

    Query: {
        myJobs: () => []
    },

    Mutation: {
        signUp: async (_, { input }, { db }) => {
            const hashedPassword = bcrypt.hashSync(input.password);

            const currentdate = new Date();
            const datetime = currentdate.getMonth()+1 + "/" + currentdate.getDay()
                + "/" + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":" + currentdate.getSeconds();
                
            const newUser = {
                ...input,
                password: hashedPassword,
                role: "TASKER",
                signUpDate: datetime,
                lastUpdated: datetime
            }

            //save to database
            const result = await db.collection('Users').insertOne(newUser);
            const someId = result.insertedId;
            const user = await db.collection('Users').findOne({ _id: someId });
            return {
                user: user,
                token: getToken(user),
            };

        },

        signIn: async (_, { input }, { db }) => {
            const user = await db.collection('Users').findOne({ email: input.email });

            //check if user email exists in the database
            if (!user) {
                throw new Error('Invalid credentials!');
            }

            //check if password is correct
            const isPasswordCorrect = bcrypt.compareSync(input.password, user.password);
            if (!isPasswordCorrect) {
                throw new Error('Invalid credentials!')
            }

            return {
                user: user,
                token: getToken(user),
            }
        },

        updateUser: async (_, {input}, { db, user}) => {
            //check if user tying to update exists in the db
            const updateUser = await db.collection('Users').findOne({ _id: ObjectId(input.id) });

            if(!updateUser) {
                throw new Error('The user you are trying to update does not exist.')
            }
            //get the active users role
            const activeRole = user.role;
            //get update user role
            const updateRole = updateUser.role;
            //check if user is updating self or other
            const updatingSelf = updateUser._id.equals(user._id);
            console.log(updatingSelf);
            console.log(updateUser._id);
            console.log(user._id);
            //check if user has permission to update the user they want to update
            //should not be able to update their own role or other users personal info 
            //if the person they are trying to update is a higher role then they are
            if(updatingSelf && input.role != null){
                throw new Error('Can not update own user role.');
            }
            let canUpdate = true;
            if (!updatingSelf && (activeRole == 'TASKER' || activeRole == updateRole)){
                canUpdate = false;
            }
            if (!updatingSelf && (activeRole== 'JOB_MANAGER' && (updateRole == 'COMPANY_MANAGER' || updateRole == 'SYSTEM_MANAGER'))){
                canUpdate = false;
            }
            if (!updatingSelf && (activeRole == 'COMPANY_MANAGER' && updateRole == 'SYSTEM_MANAGER')) {
                canUpdate = false;
            }
            if(!canUpdate){
                throw new Error('Can not update user of same or higher role than you.')
            }

            const currentdate = new Date();
            const datetime = currentdate.getDay() + "/" + currentdate.getMonth()
                + "/" + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":" + currentdate.getSeconds();
            
            // try {
                const result = await db.collection('Users').updateOne({ _id: ObjectId(input.id)},
                    {$set: {name: {first: input.name.first, middle: input.name.middle, last: input.name.last}, 
                        avatar: input.avatar, 
                        bio: input.bio,
                        phone: input.phone,
                        address: {
                            street: input.address.street,
                            city: input.address.city,
                            state: input.address.state,
                            zip: input.address.zip
                        },
                        schedual: input.schedual,
                        role: input.role,
                        lastUpdated: datetime
                    }
                });

                const updatedUser = await db.collection('Users').findOne({ _id: updateUser._id });
                console.log(updatedUser.name.last);
    
                return {
                    code: result.acknowledged,
                    success: true,
                    message: "Successfully updated user",
                    user: {
                            id: updateUser._id,
                            name: {
                                first: updatedUser.name.first,
                                middle: updatedUser.name.middle,
                                last: updatedUser.name.last
                            },
                            email: updatedUser.email,
                            role: updatedUser.role,
                            signUpDate: updatedUser.signUpDate,
                            lastModDate: updatedUser.lastModDate
                            }
                }
            // } catch (error) {
            //     throw new Error(error);
            // }
        },

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

//async function to start db access
const start = async () => {
    const client = new MongoClient(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    client.connect();
    const db = client.db(DB_NAME);

    //only after connecting to the database will we start the server
    // The ApolloServer constructor requires two parameters: your schema
    // definition and your set of resolvers.
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: async ({ req }) => {
            const user = await getUserFromToken(req.headers.authorization, db);
            return {
                db,
                user,
            }
        },
    });

    // The `listen` method launches a web server.
    server.listen().then(({ url }) => {
        console.log(`🚀  Server ready at ${url}`);
    });
}

start();
