//imports
const { ApolloServer, gql } = require('apollo-server');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
//bcrypt for password encryption
const bcrypt = require('bcryptjs');
//jsonwebtoken for session token
const jwt = require('jsonwebtoken');

//merge and schema imports
import { merge } from 'lodash';
import { typeDef as User, resolvers as userResolvers } from './schema models/User';
import { typeDef as Company, resolvers as companyResolvers } from './schema models/Company';
import { typeDef as Role } from './schema models/Role';
import { typeDef as Job } from './schema models/Job';
import { typeDef as Location } from './schema models/Location';
import { typeDef as Report } from './schema models/Report';
import { typeDef as Address} from './schema models/Address';

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

//schema material that doesnt fit into a model
const noModelDefs = gql`
    type Mutation {
        signUp(input: SignUpInput!): AuthUser!
        signIn(input: SignInInput!): AuthUser!
    }

    input SignUpInput {
        email: String!
        password: String!
        name: String!
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
const noModelResolvers = {
    Query: {
        myJobs: () => []
    },

    Mutation: {
        signUp: async (_, { input }, { db }) => {
            const hashedPassword = bcrypt.hashSync(input.password);
            const newUser = {
                ...input,
                password: hashedPassword
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
    }

};

//put together all schema models and resolvers
makeExecutableSchema({
    typeDefs: [noModelDefs, User, Company, Location, Job, Address, Report, Role],
    resolvers: merge(noModelResolvers, userResolvers, companyResolvers),
});

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
