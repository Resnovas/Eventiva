import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EmployersOnAccountCreateInput } from "../../../inputs/EmployersOnAccountCreateInput";

@TypeGraphQL.ArgsType()
export class CreateEmployersOnAccountArgs {
  @TypeGraphQL.Field(_type => EmployersOnAccountCreateInput, {
    nullable: false
  })
  data!: EmployersOnAccountCreateInput;
}
