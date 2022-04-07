import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RTWCountOrderByAggregateInput } from "../inputs/RTWCountOrderByAggregateInput";
import { RTWMaxOrderByAggregateInput } from "../inputs/RTWMaxOrderByAggregateInput";
import { RTWMinOrderByAggregateInput } from "../inputs/RTWMinOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("RTWOrderByWithAggregationInput", {
  isAbstract: true
})
export class RTWOrderByWithAggregationInput {
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
  active?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  startDate?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  endDate?: "asc" | "desc" | undefined;

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

  @TypeGraphQL.Field(_type => RTWCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: RTWCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => RTWMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: RTWMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => RTWMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: RTWMinOrderByAggregateInput | undefined;
}
