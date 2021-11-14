import 'reflect-metadata';
import { resolvers } from '@generated/type-graphql';
import { PrismaClient } from '@prisma/client';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer as ApolloExpress } from 'apollo-server-express';
import express, { Express } from 'express';
import { buildSchemaSync } from 'type-graphql';

const app = express();
const prisma = new PrismaClient();
const schema = buildSchemaSync({
  resolvers,
  validate: false,
  emitSchemaFile: '../schema.gql',
});

/***********************************/
/* SOFT DELETE MIDDLEWARE */
/***********************************/

prisma.$use(async (params, next) => {
  if (params.model == 'Post') {
    if (params.action == 'findUnique') {
      // Change to findFirst - you cannot filter
      // by anything except ID / unique with findUnique
      params.action = 'findFirst';
      // Add 'deleted' filter
      // ID filter maintained
      params.args.where['deleted'] = null;
    }
    if (params.action == 'findMany') {
      // Find many queries
      if (params.args.where != undefined) {
        if (params.args.where.deleted == undefined) {
          // Exclude deleted records if they have not been expicitly requested
          params.args.where['deleted'] = null;
        }
      } else {
        params.args['where'] = { deleted: null };
      }
    }
    if (params.action == 'update') {
      // Change to updateMany - you cannot filter
      // by anything except ID / unique with findUnique
      params.action = 'updateMany';
      // Add 'deleted' filter
      // ID filter maintained
      params.args.where['deleted'] = null;
    }
    if (params.action == 'updateMany') {
      if (params.args.where != undefined) {
        params.args.where['deleted'] = null;
      } else {
        params.args['where'] = { deleted: null };
      }
    }
    if (params.action == 'delete') {
      // Delete queries
      // Change action to an update
      params.action = 'update';
      params.args['data'] = { deleted: new Date() };
    }
    if (params.action == 'deleteMany') {
      // Delete many queries
      params.action = 'updateMany';
      if (params.args.data != undefined) {
        params.args.data['deleted'] = new Date();
      } else {
        params.args['data'] = { deleted: new Date() };
      }
    }
  }
  return next(params);
});

const server = new ApolloExpress({
  schema,
  introspection: true,
  context: { prisma },
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});

server
  .start()
  .then(() => {
    server.applyMiddleware({ app, path: '/', cors: false });
  })
  .catch(console.error);

export const handler: Express = app;
