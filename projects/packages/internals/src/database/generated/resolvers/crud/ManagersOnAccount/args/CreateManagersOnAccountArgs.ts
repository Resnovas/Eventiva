import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ManagersOnAccountCreateInput } from "../../../inputs/ManagersOnAccountCreateInput";

@TypeGraphQL.ArgsType()
export class CreateManagersOnAccountArgs {
  @TypeGraphQL.Field(_type => ManagersOnAccountCreateInput, {
    nullable: false
  })
  data!: ManagersOnAccountCreateInput;
}
