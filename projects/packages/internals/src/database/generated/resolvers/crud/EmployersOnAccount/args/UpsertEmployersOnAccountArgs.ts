import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EmployersOnAccountCreateInput } from "../../../inputs/EmployersOnAccountCreateInput";
import { EmployersOnAccountUpdateInput } from "../../../inputs/EmployersOnAccountUpdateInput";
import { EmployersOnAccountWhereUniqueInput } from "../../../inputs/EmployersOnAccountWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpsertEmployersOnAccountArgs {
  @TypeGraphQL.Field(_type => EmployersOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: EmployersOnAccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => EmployersOnAccountCreateInput, {
    nullable: false
  })
  create!: EmployersOnAccountCreateInput;

  @TypeGraphQL.Field(_type => EmployersOnAccountUpdateInput, {
    nullable: false
  })
  update!: EmployersOnAccountUpdateInput;
}
