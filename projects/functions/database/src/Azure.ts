import 'reflect-metadata';

import { ApolloServer } from 'apollo-server-azure-functions';
import { options } from './util/helpers';

/**============================================
 **               Azure Handler
 *=============================================**/

const Azure = new ApolloServer({ ...options });
export const handler: any = Azure.createHandler();
