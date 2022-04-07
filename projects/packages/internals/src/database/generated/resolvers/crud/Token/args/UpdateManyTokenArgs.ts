import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { TokenUpdateManyMutationInput } from "../../../inputs/TokenUpdateManyMutationInput";
import { TokenWhereInput } from "../../../inputs/TokenWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyTokenArgs {
  @TypeGraphQL.Field(_type => TokenUpdateManyMutationInput, {
    nullable: false
  })
  data!: TokenUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => TokenWhereInput, {
    nullable: true
  })
  where?: TokenWhereInput | undefined;
}
