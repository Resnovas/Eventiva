import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AddressOrderByRelationAggregateInput } from "../inputs/AddressOrderByRelationAggregateInput";
import { VenueStyleOrderByRelevanceInput } from "../inputs/VenueStyleOrderByRelevanceInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("VenueStyleOrderByWithRelationAndSearchRelevanceInput", {
  isAbstract: true
})
export class VenueStyleOrderByWithRelationAndSearchRelevanceInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  id?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  createdAt?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  updatedAt?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => AddressOrderByRelationAggregateInput, {
    nullable: true
  })
  address?: AddressOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  name?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  details?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  deletedDate?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  deleted?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => VenueStyleOrderByRelevanceInput, {
    nullable: true
  })
  _relevance?: VenueStyleOrderByRelevanceInput | undefined;
}
