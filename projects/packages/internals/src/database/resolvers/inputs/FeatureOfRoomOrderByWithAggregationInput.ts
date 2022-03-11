import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FeatureOfRoomCountOrderByAggregateInput } from "../inputs/FeatureOfRoomCountOrderByAggregateInput";
import { FeatureOfRoomMaxOrderByAggregateInput } from "../inputs/FeatureOfRoomMaxOrderByAggregateInput";
import { FeatureOfRoomMinOrderByAggregateInput } from "../inputs/FeatureOfRoomMinOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("FeatureOfRoomOrderByWithAggregationInput", {
  isAbstract: true
})
export class FeatureOfRoomOrderByWithAggregationInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  roomId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  featureId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  data?: "asc" | "desc" | undefined;

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

  @TypeGraphQL.Field(_type => FeatureOfRoomCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: FeatureOfRoomCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => FeatureOfRoomMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: FeatureOfRoomMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => FeatureOfRoomMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: FeatureOfRoomMinOrderByAggregateInput | undefined;
}
