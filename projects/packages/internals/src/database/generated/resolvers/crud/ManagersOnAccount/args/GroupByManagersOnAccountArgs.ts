import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ManagersOnAccountOrderByWithAggregationInput } from "../../../inputs/ManagersOnAccountOrderByWithAggregationInput";
import { ManagersOnAccountScalarWhereWithAggregatesInput } from "../../../inputs/ManagersOnAccountScalarWhereWithAggregatesInput";
import { ManagersOnAccountWhereInput } from "../../../inputs/ManagersOnAccountWhereInput";
import { ManagersOnAccountScalarFieldEnum } from "../../../../enums/ManagersOnAccountScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByManagersOnAccountArgs {
  @TypeGraphQL.Field(_type => ManagersOnAccountWhereInput, {
    nullable: true
  })
  where?: ManagersOnAccountWhereInput | undefined;

  @TypeGraphQL.Field(_type => [ManagersOnAccountOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: ManagersOnAccountOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [ManagersOnAccountScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"accountId" | "managersId" | "createdAt" | "updatedAt" | "deletedDate" | "deleted">;

  @TypeGraphQL.Field(_type => ManagersOnAccountScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: ManagersOnAccountScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
