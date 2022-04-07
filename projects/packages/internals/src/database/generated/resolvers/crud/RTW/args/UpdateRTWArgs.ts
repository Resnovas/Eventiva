import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { RTWUpdateInput } from "../../../inputs/RTWUpdateInput";
import { RTWWhereUniqueInput } from "../../../inputs/RTWWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateRTWArgs {
  @TypeGraphQL.Field(_type => RTWUpdateInput, {
    nullable: false
  })
  data!: RTWUpdateInput;

  @TypeGraphQL.Field(_type => RTWWhereUniqueInput, {
    nullable: false
  })
  where!: RTWWhereUniqueInput;
}
