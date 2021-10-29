import express from 'express'
import { createHttpTerminator, HttpTerminator } from 'http-terminator';
import { GraphQLSchema } from "graphql"
import { makeExecutableSchema } from 'graphql-tools'
import { OpenAPI, useSofa } from 'sofa-api'
import { buildSchema, buildTypeDefsAndResolvers } from 'type-graphql'
import { Manager } from '.'
import { resolvers } from '@generated/type-graphql'
import { ApolloServer } from 'apollo-server-express'
import { Passport } from 'passport'
import fs from 'fs'
// import { Strategy } from 'passport-local'

export type ServerConstructData = {
  root?: Manager
  enabled: boolean
}

export class initServer {
  root: Manager
  server = express()
  apollo?: ApolloServer
  schema?: GraphQLSchema
  httpTerminator?: HttpTerminator
  passport = new Passport()
  constructor(options: ServerConstructData) {
    if (!options.root) throw new Error(
      'option.root is undefined. Cannot construct database. Please contact package developers.'
    )
    this.root = options.root
    this.root.log('100', `Launching Server...`)
    this.main()
  }

  async main() {
    this.schema = await buildSchema({
      resolvers,
      validate: false,
      emitSchemaFile: {
        path: process.cwd() + "/schema/schema.gql",
        commentDescriptions: true,
        sortedSchema: false
      }
    })
    await this.configurePassport()
    await this.configureRest()
    await this.configureQL()
    await this.listen()
  }

  async configurePassport() {
    this.server.use(this.passport.initialize())
    this.server.use(this.passport.session())
  }

  async configureQL() {
    this.apollo = new ApolloServer({
      schema: this.schema,
      playground: true,
      context: () => ({ prisma: this.root.modules.database!.prisma })
    })
    this.apollo.applyMiddleware({ app: this.server })
  }

  async configureRest() {
    const resting = await buildTypeDefsAndResolvers({
      resolvers
    })
    const openApi = OpenAPI({
      schema: makeExecutableSchema({
        typeDefs: resting.typeDefs,
        resolvers: resting.resolvers
      }),
      info: {
        title: 'Smartcloud Assistant Public API',
        version: this.root.version
      }
    })
    this.server.use(
      '/rest',
      useSofa({
        schema: this.schema!,
        onRoute(info) {
          openApi.addRoute(info, {
            basePath: '/rest'
          })
        },
        context: { prisma: this.root.modules.database!.prisma }
      })
    )
    openApi.save('./schema/openAPI.yaml')
  }

  listen() {
    const server = this.server.listen(this.root.port)
    this.httpTerminator = createHttpTerminator({ server })
    this.root.log('100', `Server listening on ${this.root.port}`)
    this.root.log('100', `GraphQL ready at http://localhost:${this.root.port}${this.apollo!.graphqlPath}`)
    this.root.log('100', `Rest ready at http://localhost:${this.root.port}/rest`)
  }

  async destroy() {
    if (this.httpTerminator) await this.httpTerminator.terminate()
  }
}
