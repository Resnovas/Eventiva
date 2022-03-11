import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FeatureCountOrderByAggregateInput } from "../inputs/FeatureCountOrderByAggregateInput";
import { FeatureMaxOrderByAggregateInput } from "../inputs/FeatureMaxOrderByAggregateInput";
import { FeatureMinOrderByAggregateInput } from "../inputs/FeatureMinOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("FeatureOrderByWithAggregationInput", {
  isAbstract: true
})
export class FeatureOrderByWithAggregationInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  id?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  name?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  type?: "asc" | "desc" | undefined;

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

  @TypeGraphQL.Field(_type => FeatureCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: FeatureCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => FeatureMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: FeatureMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => FeatureMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: FeatureMinOrderByAggregateInput | undefined;
}
