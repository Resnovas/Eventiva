import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { TokenWhereInput } from "../../../inputs/TokenWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyTokenArgs {
  @TypeGraphQL.Field(_type => TokenWhereInput, {
    nullable: true
  })
  where?: TokenWhereInput | undefined;
}
