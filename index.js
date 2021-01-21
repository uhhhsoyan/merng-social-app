const { ApolloServer, PubSub } = require('apollo-server');
const gql = require('graphql-tag'); //dependency of apollo-server...installed with apollo-server
const mongoose = require('mongoose'); //mongo is an ORM

const typeDefs = require('./graphQL/typeDefs');
const resolvers = require('./graphQL/resolvers');
const { MONGODB } = require('./config.js');

const pubsub = new PubSub();

const PORT = process.env.port || 5000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req, pubsub }) // req allows us to access req through context, pubsub for subscriptions
});

mongoose.connect(MONGODB, { useNewUrlParser: true })
  .then(() => {
    console.log('MongoDB Connected')
    return server.listen({ port: PORT })
  }).then((res) => {
    console.log(`Server running at ${res.url}`);
  }).catch(err => {
    console.error(err);
  })
