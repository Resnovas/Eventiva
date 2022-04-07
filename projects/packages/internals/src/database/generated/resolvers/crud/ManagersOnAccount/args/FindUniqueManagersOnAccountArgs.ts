import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ManagersOnAccountWhereUniqueInput } from "../../../inputs/ManagersOnAccountWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class FindUniqueManagersOnAccountArgs {
  @TypeGraphQL.Field(_type => ManagersOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: ManagersOnAccountWhereUniqueInput;
}
