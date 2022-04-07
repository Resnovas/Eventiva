import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ApplicationWhereInput } from "../../../inputs/ApplicationWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyApplicationArgs {
  @TypeGraphQL.Field(_type => ApplicationWhereInput, {
    nullable: true
  })
  where?: ApplicationWhereInput | undefined;
}
