import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { TokenUpdateInput } from "../../../inputs/TokenUpdateInput";
import { TokenWhereUniqueInput } from "../../../inputs/TokenWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateTokenArgs {
  @TypeGraphQL.Field(_type => TokenUpdateInput, {
    nullable: false
  })
  data!: TokenUpdateInput;

  @TypeGraphQL.Field(_type => TokenWhereUniqueInput, {
    nullable: false
  })
  where!: TokenWhereUniqueInput;
}
