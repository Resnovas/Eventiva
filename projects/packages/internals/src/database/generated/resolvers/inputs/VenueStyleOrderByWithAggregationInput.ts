import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { VenueStyleCountOrderByAggregateInput } from "../inputs/VenueStyleCountOrderByAggregateInput";
import { VenueStyleMaxOrderByAggregateInput } from "../inputs/VenueStyleMaxOrderByAggregateInput";
import { VenueStyleMinOrderByAggregateInput } from "../inputs/VenueStyleMinOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("VenueStyleOrderByWithAggregationInput", {
  isAbstract: true
})
export class VenueStyleOrderByWithAggregationInput {
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

  @TypeGraphQL.Field(_type => VenueStyleCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: VenueStyleCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => VenueStyleMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: VenueStyleMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => VenueStyleMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: VenueStyleMinOrderByAggregateInput | undefined;
}
