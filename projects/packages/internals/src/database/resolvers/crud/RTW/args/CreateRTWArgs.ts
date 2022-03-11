import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { RTWCreateInput } from "../../../inputs/RTWCreateInput";

@TypeGraphQL.ArgsType()
export class CreateRTWArgs {
  @TypeGraphQL.Field(_type => RTWCreateInput, {
    nullable: false
  })
  data!: RTWCreateInput;
}
