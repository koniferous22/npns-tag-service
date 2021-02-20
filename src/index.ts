import 'reflect-metadata';
import { buildFederatedSchema } from '@apollo/federation';
import { ApolloServer } from 'apollo-server';
import { printSchema } from 'graphql';
import gql from 'graphql-tag';
import { buildSchema, createResolversMap } from 'type-graphql';
import { createConnection } from 'typeorm';
import { TagResolver } from './resolvers/Tag';
import { TagServiceContext } from './context';

const bootstrap = async () => {
  const port = parseInt(process.env.PORT ?? '', 10);
  // Make config file similar to gateway if necessary
  if (Number.isNaN(port)) {
    throw new Error(
      `Invalid port from config 'TAG_SERVICE_PORT': ${process.env.TAG_SERVICE_PORT}`
    );
  }
  const connection = await createConnection();
  const typeGraphQLSchema = await buildSchema({
    resolvers: [TagResolver]
    // skipCheck: true
  });
  const schema = buildFederatedSchema({
    typeDefs: gql(printSchema(typeGraphQLSchema)),
    resolvers: createResolversMap(typeGraphQLSchema) as any
  });
  const server = new ApolloServer({
    schema,
    context: {
      em: connection.createEntityManager()
    } as TagServiceContext
  });
  server.listen({ port }).then(({ url }) => {
    console.log(`🚀 Tag service ready at ${url}`);
  });
};

bootstrap();
