import 'reflect-metadata';

import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import express, { Express } from 'express';
import { options } from './util/helpers';

/**============================================
 **               Express Handler
 *=============================================**/
const app = express();
const server = new ApolloServer({
  ...options,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});
server
  .start()
  .then(() => {
    server.applyMiddleware({ app, path: '/', cors: false });
  })
  .catch(console.error);
export const handler: Express = app;
