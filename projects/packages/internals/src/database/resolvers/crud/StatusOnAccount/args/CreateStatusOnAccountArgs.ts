import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { StatusOnAccountCreateInput } from "../../../inputs/StatusOnAccountCreateInput";

@TypeGraphQL.ArgsType()
export class CreateStatusOnAccountArgs {
  @TypeGraphQL.Field(_type => StatusOnAccountCreateInput, {
    nullable: false
  })
  data!: StatusOnAccountCreateInput;
}
