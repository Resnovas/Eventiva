import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EmployersOnAccountWhereUniqueInput } from "../../../inputs/EmployersOnAccountWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class FindUniqueEmployersOnAccountArgs {
  @TypeGraphQL.Field(_type => EmployersOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: EmployersOnAccountWhereUniqueInput;
}
