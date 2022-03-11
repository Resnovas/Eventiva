import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SIABadgeAvgOrderByAggregateInput } from "../inputs/SIABadgeAvgOrderByAggregateInput";
import { SIABadgeCountOrderByAggregateInput } from "../inputs/SIABadgeCountOrderByAggregateInput";
import { SIABadgeMaxOrderByAggregateInput } from "../inputs/SIABadgeMaxOrderByAggregateInput";
import { SIABadgeMinOrderByAggregateInput } from "../inputs/SIABadgeMinOrderByAggregateInput";
import { SIABadgeSumOrderByAggregateInput } from "../inputs/SIABadgeSumOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("SIABadgeOrderByWithAggregationInput", {
  isAbstract: true
})
export class SIABadgeOrderByWithAggregationInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  id?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  licenseSector?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  type?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  licenseExplanation?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  additionalTerms?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  createdAt?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  active?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  expiry?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  updatedAt?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  deleted?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  account_id?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SIABadgeCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: SIABadgeCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => SIABadgeAvgOrderByAggregateInput, {
    nullable: true
  })
  _avg?: SIABadgeAvgOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => SIABadgeMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: SIABadgeMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => SIABadgeMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: SIABadgeMinOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => SIABadgeSumOrderByAggregateInput, {
    nullable: true
  })
  _sum?: SIABadgeSumOrderByAggregateInput | undefined;
}
