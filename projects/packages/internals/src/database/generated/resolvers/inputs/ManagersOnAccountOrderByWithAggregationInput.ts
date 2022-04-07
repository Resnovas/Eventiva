import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ManagersOnAccountCountOrderByAggregateInput } from "../inputs/ManagersOnAccountCountOrderByAggregateInput";
import { ManagersOnAccountMaxOrderByAggregateInput } from "../inputs/ManagersOnAccountMaxOrderByAggregateInput";
import { ManagersOnAccountMinOrderByAggregateInput } from "../inputs/ManagersOnAccountMinOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("ManagersOnAccountOrderByWithAggregationInput", {
  isAbstract: true
})
export class ManagersOnAccountOrderByWithAggregationInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  accountId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  managersId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  createdAt?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  updatedAt?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  deletedDate?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  deleted?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => ManagersOnAccountCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: ManagersOnAccountCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => ManagersOnAccountMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: ManagersOnAccountMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => ManagersOnAccountMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: ManagersOnAccountMinOrderByAggregateInput | undefined;
}
