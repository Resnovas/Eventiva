import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { TokenCreateWithoutAccountInput } from "../inputs/TokenCreateWithoutAccountInput";
import { TokenWhereUniqueInput } from "../inputs/TokenWhereUniqueInput";

@TypeGraphQL.InputType("TokenCreateOrConnectWithoutAccountInput", {
  isAbstract: true
})
export class TokenCreateOrConnectWithoutAccountInput {
  @TypeGraphQL.Field(_type => TokenWhereUniqueInput, {
    nullable: false
  })
  where!: TokenWhereUniqueInput;

  @TypeGraphQL.Field(_type => TokenCreateWithoutAccountInput, {
    nullable: false
  })
  create!: TokenCreateWithoutAccountInput;
}
