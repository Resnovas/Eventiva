import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FeatureOfAddressOrderByRelationAggregateInput } from "../inputs/FeatureOfAddressOrderByRelationAggregateInput";
import { FeatureOfRoomOrderByRelationAggregateInput } from "../inputs/FeatureOfRoomOrderByRelationAggregateInput";
import { FeatureOrderByRelevanceInput } from "../inputs/FeatureOrderByRelevanceInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("FeatureOrderByWithRelationAndSearchRelevanceInput", {
  isAbstract: true
})
export class FeatureOrderByWithRelationAndSearchRelevanceInput {
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

  @TypeGraphQL.Field(_type => FeatureOfRoomOrderByRelationAggregateInput, {
    nullable: true
  })
  featureOfRoom?: FeatureOfRoomOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field(_type => FeatureOfAddressOrderByRelationAggregateInput, {
    nullable: true
  })
  featureOfAddress?: FeatureOfAddressOrderByRelationAggregateInput | undefined;

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

  @TypeGraphQL.Field(_type => FeatureOrderByRelevanceInput, {
    nullable: true
  })
  _relevance?: FeatureOrderByRelevanceInput | undefined;
}
