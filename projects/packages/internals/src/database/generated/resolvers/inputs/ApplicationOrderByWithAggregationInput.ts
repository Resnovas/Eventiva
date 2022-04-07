import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ApplicationCountOrderByAggregateInput } from "../inputs/ApplicationCountOrderByAggregateInput";
import { ApplicationMaxOrderByAggregateInput } from "../inputs/ApplicationMaxOrderByAggregateInput";
import { ApplicationMinOrderByAggregateInput } from "../inputs/ApplicationMinOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("ApplicationOrderByWithAggregationInput", {
  isAbstract: true
})
export class ApplicationOrderByWithAggregationInput {
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
  accountId?: "asc" | "desc" | undefined;

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

  @TypeGraphQL.Field(_type => ApplicationCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: ApplicationCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => ApplicationMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: ApplicationMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => ApplicationMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: ApplicationMinOrderByAggregateInput | undefined;
}
