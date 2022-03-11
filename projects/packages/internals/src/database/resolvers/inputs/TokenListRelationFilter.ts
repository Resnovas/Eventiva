import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { TokenWhereInput } from "../inputs/TokenWhereInput";

@TypeGraphQL.InputType("TokenListRelationFilter", {
  isAbstract: true
})
export class TokenListRelationFilter {
  @TypeGraphQL.Field(_type => TokenWhereInput, {
    nullable: true
  })
  every?: TokenWhereInput | undefined;

  @TypeGraphQL.Field(_type => TokenWhereInput, {
    nullable: true
  })
  some?: TokenWhereInput | undefined;

  @TypeGraphQL.Field(_type => TokenWhereInput, {
    nullable: true
  })
  none?: TokenWhereInput | undefined;
}
