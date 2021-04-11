import 'reflect-metadata';
import express, { Request } from 'express';
import { buildFederatedSchema } from '@apollo/federation';
// eslint-disable-next-line import/no-named-as-default
import federationDirectives from '@apollo/federation/dist/directives';
import { specifiedDirectives } from 'graphql';
import { ApolloServer } from 'apollo-server-express';
import { addResolversToSchema } from 'apollo-graphql';
import gql from 'graphql-tag';
import { printSchemaWithDirectives } from '@graphql-tools/utils';
import { buildSchema, createResolversMap } from 'type-graphql';
import { createConnection } from 'typeorm';
import { graphqlUploadExpress } from 'graphql-upload';
import { TagResolver } from './resolvers/Tag';
import { ChallengeServiceContext } from './context';
import { router } from './routes';
import { Config } from './config';
import { authChecker } from './authChecker';
import { resolveWalletReference } from './references/Wallet';
import { fixFieldSchemaDirectives } from './utils/fixFieldDirectives';
import { Wallet } from './entities/Wallet';
import { ChallengeResolver } from './resolvers/Challenge';
import { BaseContentResolver } from './resolvers/BaseContent';
import { ChallengeEditResolver } from './resolvers/ChallengeEdit';
import { gridFsConnectMongodb } from './utils/gridFsConnection';
import { GridFS } from './external/GridFS';

const federationFieldDirectivesFixes: Parameters<
  typeof fixFieldSchemaDirectives
>[1] = [
  {
    objectTypeName: 'Wallet',
    fieldDefinitionName: 'id',
    directiveName: 'external'
  },
  {
    objectTypeName: 'User',
    fieldDefinitionName: 'id',
    directiveName: 'external'
  }
];

const bootstrap = async () => {
  const { port, graphqlPath, content } = Config.getInstance().getConfig();
  const connection = await createConnection();
  const em = connection.createEntityManager();
  const gridFsDb = await gridFsConnectMongodb(content.mongo);
  const gridFileSystem = new GridFS(gridFsDb);

  const typeGraphQLSchema = await buildSchema({
    resolvers: [
      TagResolver,
      BaseContentResolver,
      ChallengeResolver,
      ChallengeEditResolver
    ],
    directives: [...specifiedDirectives, ...federationDirectives],
    orphanedTypes: [Wallet],
    authChecker
  });

  const schema = buildFederatedSchema({
    typeDefs: gql(
      fixFieldSchemaDirectives(
        printSchemaWithDirectives(typeGraphQLSchema),
        federationFieldDirectivesFixes
      )
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolvers: createResolversMap(typeGraphQLSchema) as any
  });
  addResolversToSchema(schema, {
    Wallet: {
      __resolveReference: resolveWalletReference
    },
    Tag: {
      __resolveReference: resolveWalletReference
    }
  });
  const app = express();
  app.use((req: Request, res, next) => {
    req.em = em;
    next();
  });
  app.use(router);
  app.use(graphqlUploadExpress(content.gridFs));

  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      const userFromRequest = req.headers.user as string;
      return {
        em: connection.createEntityManager(),
        user: userFromRequest ? JSON.parse(userFromRequest) : null,
        config: Config.getInstance(),
        gridFileSystem
      } as ChallengeServiceContext;
    }
  });
  server.setGraphQLPath(graphqlPath);
  server.applyMiddleware({ app });

  app.listen({ port }, () => {
    console.log(
      `🚀 Challenge service ready at http://localhost:${port}${server.graphqlPath}`
    );
  });
};

bootstrap();
