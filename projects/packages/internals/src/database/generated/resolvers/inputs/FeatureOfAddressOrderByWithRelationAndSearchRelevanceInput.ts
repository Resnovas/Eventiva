import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AddressOrderByWithRelationAndSearchRelevanceInput } from "../inputs/AddressOrderByWithRelationAndSearchRelevanceInput";
import { FeatureOfAddressOrderByRelevanceInput } from "../inputs/FeatureOfAddressOrderByRelevanceInput";
import { FeatureOrderByWithRelationAndSearchRelevanceInput } from "../inputs/FeatureOrderByWithRelationAndSearchRelevanceInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("FeatureOfAddressOrderByWithRelationAndSearchRelevanceInput", {
  isAbstract: true
})
export class FeatureOfAddressOrderByWithRelationAndSearchRelevanceInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  addressId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  featureId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => FeatureOrderByWithRelationAndSearchRelevanceInput, {
    nullable: true
  })
  feature?: FeatureOrderByWithRelationAndSearchRelevanceInput | undefined;

  @TypeGraphQL.Field(_type => AddressOrderByWithRelationAndSearchRelevanceInput, {
    nullable: true
  })
  address?: AddressOrderByWithRelationAndSearchRelevanceInput | undefined;

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
  deletedDate?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  deleted?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => FeatureOfAddressOrderByRelevanceInput, {
    nullable: true
  })
  _relevance?: FeatureOfAddressOrderByRelevanceInput | undefined;
}
