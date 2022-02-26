import 'reflect-metadata';

import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-lambda';
import { options } from './util/helpers';

/**============================================
 **               Lamba Handler
 *=============================================**/
const lambda = new ApolloServer({
  ...options,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});
export const handler: any = lambda.createHandler();
