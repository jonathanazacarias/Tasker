//imports
const { ApolloServer, gql } = require('apollo-server');
const { MongoClient, ServerApiVersion } = require('mongodb');
//bcrypt for password encryption
const bcrypt = require('bcryptjs');

//require the dotenv file to get the database info
const dotenv = require('dotenv');
dotenv.config();

//database access information from .env file
const { DB_URI, DB_NAME } = process.env;

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  type Mutation {
      signUp(input: SignUpInput): AuthUser!
      signIn(input: SignInInput): AuthUser!
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

  type AuthUser {
      user: User!
      token: String!
  }

  type User {
      id: ID!
      name: String!
      email: String!
      avatar: String
  }

  type Company {
      id: ID!
      name: String!
  }

  type Job {
      id: ID!
      name: String!
      company: Company!
      location: String!
      users: [User]!
  }

  type Report {
      id: ID!
      job: Job!
      date: String!
      users: [User!]!
      trackedUnits: [String]!
      violations: [String]!
  }


# QUERY TYPES

  type Query {
    myJobs: [Job!]!
  }
`;

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above. 
const resolvers = {
    Query: {
        myJobs: () => []
    },
    Mutation: {
        signUp: async (_, {input}, {db}) => {
            const hashedPassword = bcrypt.hashSync(input.password);
            const newUser = {
                ...input,
                password: hashedPassword,
            }

            //save to database
            const result = await db.collection('Users').insertOne(newUser);
            console.log(result);
            // const user = result.ops[0]
            // return {
            //     user,
            //     token: 'token'
            // }

        },

        signIn: () => {
            
        }
    }
};

//async function to start db access
const start = async () => {
    const client = new MongoClient(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    client.connect();
    const db = client.db(DB_NAME);

    //set the context for the query (could make db global but this would not be optimal as the project grows)
    const context = {
        db,
    }

    //only after connecting to the database will we start the server
    // The ApolloServer constructor requires two parameters: your schema
    // definition and your set of resolvers.
    const server = new ApolloServer({ typeDefs, resolvers, context });

    // The `listen` method launches a web server.
    server.listen().then(({ url }) => {
        console.log(`🚀  Server ready at ${url}`);
    });
}

start();
