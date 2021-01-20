const { ApolloServer, PubSub } = require('apollo-server');
const gql = require('graphql-tag'); //dependency of apollo-server...installed with apollo-server
const mongoose = require('mongoose'); //mongo is an ORM

const typeDefs = require('./graphQL/typeDefs');
const resolvers = require('./graphQL/resolvers');
const { MONGODB } = require('./config.js');

const pubsub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req, pubsub }) // req allows us to access req through context, pubsub for subscriptions
});

mongoose.connect(MONGODB, { useNewUrlParser: true })
  .then(() => {
    console.log('MongoDB Connected')
    return server.listen({ port: 5000 })
  }).then((res) => {
    console.log(`Server running at ${res.url}`);
  })
