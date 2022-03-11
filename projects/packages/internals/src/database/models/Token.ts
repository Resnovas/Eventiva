import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../scalars";
import { Account } from "../models/Account";
import { TokenType } from "../enums/TokenType";

@TypeGraphQL.ObjectType("Token", {
  isAbstract: true
})
export class Token {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  id!: string;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  createdAt!: Date;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  updatedAt!: Date;

  @TypeGraphQL.Field(_type => TokenType, {
    nullable: false
  })
  type!: "API" | "PERSONAL" | "SYSTEM";

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  value!: string;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: false
  })
  valid!: boolean;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  expiry!: Date;

  account?: Account;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  apiToken!: string;
}
