import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { TokenType } from "../../enums/TokenType";

@TypeGraphQL.ObjectType("TokenMinAggregate", {
  isAbstract: true
})
export class TokenMinAggregate {
  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  id!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  nickname!: string | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  createdAt!: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  updatedAt!: Date | null;

  @TypeGraphQL.Field(_type => TokenType, {
    nullable: true
  })
  type!: "API" | "PERSONAL" | "SYSTEM" | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  value!: string | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  expiry!: Date | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  accountID!: string | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deletedDate!: Date | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  deleted!: boolean | null;
}
