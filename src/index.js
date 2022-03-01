//imports
const { ApolloServer, gql } = require('apollo-server');
const { MongoClient, ServerApiVersion } = require('mongodb');
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
const getToken = (user) => jwt.sign({ id: user.id}, JWT_SECRET, { expiresIn: '7 days'});

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
// schema. 
const resolvers = {
    Query: {
        myJobs: () => []
    },

    Mutation: {
        signUp: async (_, {input}, {db}) => {
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

        signIn: async (_, {input}, {db}) => {
            const user = await db.collection('Users').findOne({ email: input.email});

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
        }
    },

    User: {
        id: ({_id, id}) => _id || id,
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
