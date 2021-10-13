import { PrismaClient } from "@prisma/client";
import { Token } from "@generated/type-graphql"

// export interface MyContext extends PassportContext<MyUser, ExpressRequest>{}

export interface Context {
    prisma: PrismaClient
    token?: Token | null
    user?: any
}