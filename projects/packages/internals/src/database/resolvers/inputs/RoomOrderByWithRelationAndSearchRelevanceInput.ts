import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AddressOrderByWithRelationAndSearchRelevanceInput } from "../inputs/AddressOrderByWithRelationAndSearchRelevanceInput";
import { ArrangementOfRoomOrderByRelationAggregateInput } from "../inputs/ArrangementOfRoomOrderByRelationAggregateInput";
import { FeatureOfRoomOrderByRelationAggregateInput } from "../inputs/FeatureOfRoomOrderByRelationAggregateInput";
import { RoomOrderByRelevanceInput } from "../inputs/RoomOrderByRelevanceInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("RoomOrderByWithRelationAndSearchRelevanceInput", {
  isAbstract: true
})
export class RoomOrderByWithRelationAndSearchRelevanceInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  id?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => FeatureOfRoomOrderByRelationAggregateInput, {
    nullable: true
  })
  featuresOfRoom?: FeatureOfRoomOrderByRelationAggregateInput | undefined;

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

  @TypeGraphQL.Field(_type => AddressOrderByWithRelationAndSearchRelevanceInput, {
    nullable: true
  })
  address?: AddressOrderByWithRelationAndSearchRelevanceInput | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  addressId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  name?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  floor?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  building?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  accessibility?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  checkin?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  checkout?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  length?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  width?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  height?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => ArrangementOfRoomOrderByRelationAggregateInput, {
    nullable: true
  })
  arrangements?: ArrangementOfRoomOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field(_type => RoomOrderByRelevanceInput, {
    nullable: true
  })
  _relevance?: RoomOrderByRelevanceInput | undefined;
}
