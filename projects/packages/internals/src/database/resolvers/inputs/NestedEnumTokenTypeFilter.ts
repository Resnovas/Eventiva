import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { TokenType } from "../../enums/TokenType";

@TypeGraphQL.InputType("NestedEnumTokenTypeFilter", {
  isAbstract: true
})
export class NestedEnumTokenTypeFilter {
  @TypeGraphQL.Field(_type => TokenType, {
    nullable: true
  })
  equals?: "API" | "PERSONAL" | "SYSTEM" | undefined;

  @TypeGraphQL.Field(_type => [TokenType], {
    nullable: true
  })
  in?: Array<"API" | "PERSONAL" | "SYSTEM"> | undefined;

  @TypeGraphQL.Field(_type => [TokenType], {
    nullable: true
  })
  notIn?: Array<"API" | "PERSONAL" | "SYSTEM"> | undefined;

  @TypeGraphQL.Field(_type => NestedEnumTokenTypeFilter, {
    nullable: true
  })
  not?: NestedEnumTokenTypeFilter | undefined;
}
