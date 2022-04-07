import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EmployersOnAccountUpdateInput } from "../../../inputs/EmployersOnAccountUpdateInput";
import { EmployersOnAccountWhereUniqueInput } from "../../../inputs/EmployersOnAccountWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateEmployersOnAccountArgs {
  @TypeGraphQL.Field(_type => EmployersOnAccountUpdateInput, {
    nullable: false
  })
  data!: EmployersOnAccountUpdateInput;

  @TypeGraphQL.Field(_type => EmployersOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: EmployersOnAccountWhereUniqueInput;
}
