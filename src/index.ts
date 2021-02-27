import 'reflect-metadata';
import express, { Request } from 'express';
import { buildFederatedSchema } from '@apollo/federation';
import { ApolloServer } from 'apollo-server-express';
import { printSchema } from 'graphql';
import gql from 'graphql-tag';
import { buildSchema, createResolversMap } from 'type-graphql';
import { createConnection } from 'typeorm';
import { TagResolver } from './resolvers/Tag';
import { TagServiceContext } from './context';
import { router } from './routes';
import { getConfig } from './config';

const bootstrap = async () => {
  const { port, graphqlPath } = getConfig();
  const connection = await createConnection();
  const em = connection.createEntityManager();

  const typeGraphQLSchema = await buildSchema({
    resolvers: [TagResolver]
    // skipCheck: true
  });
  const schema = buildFederatedSchema({
    typeDefs: gql(printSchema(typeGraphQLSchema)),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolvers: createResolversMap(typeGraphQLSchema) as any
  });
  const app = express();
  app.use((req: Request, res, next) => {
    req.em = em;
    next();
  });
  app.use(router);

  const server = new ApolloServer({
    schema,
    context: {
      em
    } as TagServiceContext
  });
  server.setGraphQLPath(graphqlPath);
  server.applyMiddleware({ app });

  app.listen({ port }, () => {
    console.log(
      `🚀 Tag service ready at localhost:${port}${server.graphqlPath}`
    );
  });
};

bootstrap();
