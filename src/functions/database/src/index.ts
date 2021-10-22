import "reflect-metadata";
import { PrismaClient } from '@prisma/client'
import { buildSchemaSync } from 'type-graphql'
import { resolvers } from '@generated/type-graphql'
import express from "express";
import { ApolloServer as ApolloExpress } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core"

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