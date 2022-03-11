import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ApplicationUpdateInput } from "../../../inputs/ApplicationUpdateInput";
import { ApplicationWhereUniqueInput } from "../../../inputs/ApplicationWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateApplicationArgs {
  @TypeGraphQL.Field(_type => ApplicationUpdateInput, {
    nullable: false
  })
  data!: ApplicationUpdateInput;

  @TypeGraphQL.Field(_type => ApplicationWhereUniqueInput, {
    nullable: false
  })
  where!: ApplicationWhereUniqueInput;
}
