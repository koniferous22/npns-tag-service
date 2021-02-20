import 'reflect-metadata';
import { buildFederatedSchema } from '@apollo/federation';
import { ApolloServer } from 'apollo-server';
import { printSchema } from 'graphql';
import gql from 'graphql-tag';
import { buildSchema, createResolversMap } from 'type-graphql';
import { createConnections } from 'typeorm';
import { TagResolver } from './resolvers/Tag';

const bootstrap = async () => {
  await createConnections();

  const port = parseInt(process.env.PORT ?? '', 10);
  // Make config file similar to gateway if necessary
  if (Number.isNaN(port)) {
    throw new Error(
      `Invalid port from config 'TAG_SERVICE_PORT': ${process.env.TAG_SERVICE_PORT}`
    );
  }
  const typeGraphQLSchema = await buildSchema({
    resolvers: [TagResolver]
    // skipCheck: true
  });
  const schema = buildFederatedSchema({
    typeDefs: gql(printSchema(typeGraphQLSchema)),
    resolvers: createResolversMap(typeGraphQLSchema) as any
  });
  const server = new ApolloServer({
    schema
  });
  server.listen({ port }).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
};

bootstrap();
