import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ManagersOnAccountCreateInput } from "../../../inputs/ManagersOnAccountCreateInput";
import { ManagersOnAccountUpdateInput } from "../../../inputs/ManagersOnAccountUpdateInput";
import { ManagersOnAccountWhereUniqueInput } from "../../../inputs/ManagersOnAccountWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpsertManagersOnAccountArgs {
  @TypeGraphQL.Field(_type => ManagersOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: ManagersOnAccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => ManagersOnAccountCreateInput, {
    nullable: false
  })
  create!: ManagersOnAccountCreateInput;

  @TypeGraphQL.Field(_type => ManagersOnAccountUpdateInput, {
    nullable: false
  })
  update!: ManagersOnAccountUpdateInput;
}
