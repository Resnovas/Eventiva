import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ArrangementCountOrderByAggregateInput } from "../inputs/ArrangementCountOrderByAggregateInput";
import { ArrangementMaxOrderByAggregateInput } from "../inputs/ArrangementMaxOrderByAggregateInput";
import { ArrangementMinOrderByAggregateInput } from "../inputs/ArrangementMinOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("ArrangementOrderByWithAggregationInput", {
  isAbstract: true
})
export class ArrangementOrderByWithAggregationInput {
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
  icon?: "asc" | "desc" | undefined;

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

  @TypeGraphQL.Field(_type => ArrangementCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: ArrangementCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => ArrangementMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: ArrangementMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => ArrangementMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: ArrangementMinOrderByAggregateInput | undefined;
}
