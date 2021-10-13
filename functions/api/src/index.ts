import 'reflect-metadata'
import { PrismaClient } from '@prisma/client'
import { Authorized, buildSchemaSync } from 'type-graphql'
import { applyModelsEnhanceMap, resolvers } from '@generated/type-graphql'
import express from "express";
import session from "express-session";
import { ApolloServer as ApolloExpress } from "apollo-server-express";
import passport from "passport";
import {
  ApolloServerPluginLandingPageGraphQLPlayground, AuthenticationError
} from "apollo-server-core"
import { v4 as uuidv4 } from 'uuid';
import { Context } from './Context';
import { customAuthChecker } from './customAuthChecker';
import { stringify } from 'querystring';

applyModelsEnhanceMap( {
    Account: {
        fields: {
            //@ts-expect-error
            _all: [Authorized()]
        }
    }
})

const SESSION_SECRECT = 'bad secret';
passport.serializeUser((account, done) => {
    done(null, account)
})

passport.deserializeUser((id, done) => {
    if (typeof(id) !== "string") return done(new Error('id is not string'))
    const account = prisma.account.findUnique({where: {id: id}})
    done(null, account)
})

const app = express()

app.use(session({
    genid: () => uuidv4(),
    secret: SESSION_SECRECT,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }
}))
app.use(passport.initialize())
app.use(passport.session())


const prisma = new PrismaClient()
const schema = buildSchemaSync({
    resolvers,
    validate: false,
    emitSchemaFile: "../schema.gql",
    authChecker: customAuthChecker
})

const server = new ApolloExpress({
    schema,
    introspection: true,
    context: async ({ req }): Promise<Context> => {
        const tokenData = req.headers.authorization || ''
        const token = await prisma.token.findUnique({ where: { value: tokenData } })
        if (!token) throw new AuthenticationError('You must have a valid token')
        if (!token.valid) throw new AuthenticationError('Your token isn\'t valid')
        if (new Date < token.expiry) {                
            throw new AuthenticationError('Your token has expired')
        
        }
        throw new Error("Your token is: " + stringify(token))
        return ({ prisma, token })
    },
    plugins: [
        ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
});

server.start().then(() => {
    server.applyMiddleware({ app, path: '/', cors: false });
}).catch(console.error);

export const handler = app