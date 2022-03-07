import { Errors, errors } from './constants';
import { softDelete } from './softDelete';
import { ExpressContext } from 'apollo-server-express';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { Authorized, buildSchemaSync } from 'type-graphql';
import { isDev } from './constants';
import { CustomAuthChecker } from './authentication';
import {
  resolvers,
  Account,
  applyResolversEnhanceMap,
} from '@eventiva/databaseclasses';

export interface Context {
  prisma: PrismaClient;
  req: Request;
  res: Response;
  user: Account | null;
}

export const handleError = (error: any) => {
  // add any other logging mechanism here e.g. Sentry
  throw error;
};

export const returnError = (error: keyof Errors) => {
  return errors[error];
};

export const prisma = new PrismaClient();
prisma.$use(async (params: any, next: any) => softDelete(params, next));

export const createContext = (
  ctx: ExpressContext /*| LambdaContextFunctionParams*/
): Context => {
  let user: Account | null = null;
  try {
    // let Authorization: String | undefined = ''
    // // for queries and mutations
    // Authorization = ctx.req.get('Authorization')
    // // specifically for subscriptions as the above will fail
    // // Authorization = ctx?.connection?.context?.Authorization
    // const token = Authorization.replace('Bearer ', '')
    // const verifiedToken = verify(token, APP_SECRET) as Token
    // if (!verifiedToken.userId && verifiedToken.type !== tokens.access.name)
    //   userId = -1
    // else userId = verifiedToken.userId
  } catch (e) {}
  return {
    ...ctx,
    prisma,
    user,
  };
};

applyResolversEnhanceMap({
  Account: {
    _all: [Authorized()],
  },
  Address: {
    _all: [Authorized()],
  },
});

const schema = buildSchemaSync({
  resolvers,
  validate: false,
  emitSchemaFile: '../schema.gql',
  authChecker: CustomAuthChecker,
});

export const options = {
  context: createContext,
  schema: schema,
  introspection: true,
  debug: isDev(),
};
