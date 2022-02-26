import 'reflect-metadata';

import { ApolloServer } from 'apollo-server-cloud-functions';
import { options } from './util/helpers';

/**============================================
 **               Google Handler
 *=============================================**/
const google = new ApolloServer({ ...options, playground: true });
export const handler: any = google.createHandler();
