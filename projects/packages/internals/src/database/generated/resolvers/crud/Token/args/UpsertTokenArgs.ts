import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { TokenCreateInput } from "../../../inputs/TokenCreateInput";
import { TokenUpdateInput } from "../../../inputs/TokenUpdateInput";
import { TokenWhereUniqueInput } from "../../../inputs/TokenWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpsertTokenArgs {
  @TypeGraphQL.Field(_type => TokenWhereUniqueInput, {
    nullable: false
  })
  where!: TokenWhereUniqueInput;

  @TypeGraphQL.Field(_type => TokenCreateInput, {
    nullable: false
  })
  create!: TokenCreateInput;

  @TypeGraphQL.Field(_type => TokenUpdateInput, {
    nullable: false
  })
  update!: TokenUpdateInput;
}
