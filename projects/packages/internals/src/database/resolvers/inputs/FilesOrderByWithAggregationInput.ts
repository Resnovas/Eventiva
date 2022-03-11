import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FilesCountOrderByAggregateInput } from "../inputs/FilesCountOrderByAggregateInput";
import { FilesMaxOrderByAggregateInput } from "../inputs/FilesMaxOrderByAggregateInput";
import { FilesMinOrderByAggregateInput } from "../inputs/FilesMinOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("FilesOrderByWithAggregationInput", {
  isAbstract: true
})
export class FilesOrderByWithAggregationInput {
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
  rtwId?: "asc" | "desc" | undefined;

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

  @TypeGraphQL.Field(_type => FilesCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: FilesCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => FilesMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: FilesMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => FilesMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: FilesMinOrderByAggregateInput | undefined;
}
