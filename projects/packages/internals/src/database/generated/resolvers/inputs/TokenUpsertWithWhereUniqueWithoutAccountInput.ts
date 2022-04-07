import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { TokenCreateWithoutAccountInput } from "../inputs/TokenCreateWithoutAccountInput";
import { TokenUpdateWithoutAccountInput } from "../inputs/TokenUpdateWithoutAccountInput";
import { TokenWhereUniqueInput } from "../inputs/TokenWhereUniqueInput";

@TypeGraphQL.InputType("TokenUpsertWithWhereUniqueWithoutAccountInput", {
  isAbstract: true
})
export class TokenUpsertWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field(_type => TokenWhereUniqueInput, {
    nullable: false
  })
  where!: TokenWhereUniqueInput;

  @TypeGraphQL.Field(_type => TokenUpdateWithoutAccountInput, {
    nullable: false
  })
  update!: TokenUpdateWithoutAccountInput;

  @TypeGraphQL.Field(_type => TokenCreateWithoutAccountInput, {
    nullable: false
  })
  create!: TokenCreateWithoutAccountInput;
}
