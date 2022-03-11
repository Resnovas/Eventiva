import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SubscriptionOnAccountCountOrderByAggregateInput } from "../inputs/SubscriptionOnAccountCountOrderByAggregateInput";
import { SubscriptionOnAccountMaxOrderByAggregateInput } from "../inputs/SubscriptionOnAccountMaxOrderByAggregateInput";
import { SubscriptionOnAccountMinOrderByAggregateInput } from "../inputs/SubscriptionOnAccountMinOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("SubscriptionOnAccountOrderByWithAggregationInput", {
  isAbstract: true
})
export class SubscriptionOnAccountOrderByWithAggregationInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  subscriptionId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  accountId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  active?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  deactivated?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  activated?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  startedAt?: "asc" | "desc" | undefined;

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
  deleted?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SubscriptionOnAccountCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: SubscriptionOnAccountCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => SubscriptionOnAccountMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: SubscriptionOnAccountMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => SubscriptionOnAccountMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: SubscriptionOnAccountMinOrderByAggregateInput | undefined;
}
