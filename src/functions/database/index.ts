import "reflect-metadata";
import { resolvers } from '@generated/type-graphql'
import { PrismaClient } from '@prisma/client'
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core"
import { ApolloServer as ApolloExpress } from "apollo-server-express";
import express from "express";
import { buildSchemaSync } from 'type-graphql'

const app = express()
const prisma = new PrismaClient()
const schema = buildSchemaSync({
    resolvers,
    validate: false,
    emitSchemaFile: "../schema.gql"
})

const server = new ApolloExpress({
    schema,
    introspection: true,
    context: { prisma },
    plugins: [
        ApolloServerPluginLandingPageGraphQLPlayground(),
    ]
});

server.start().then(() => {
    server.applyMiddleware({ app, path: '/', cors: false });
}).catch(console.error);

export const handler = app