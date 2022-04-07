import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EmployersOnAccountCountOrderByAggregateInput } from "../inputs/EmployersOnAccountCountOrderByAggregateInput";
import { EmployersOnAccountMaxOrderByAggregateInput } from "../inputs/EmployersOnAccountMaxOrderByAggregateInput";
import { EmployersOnAccountMinOrderByAggregateInput } from "../inputs/EmployersOnAccountMinOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("EmployersOnAccountOrderByWithAggregationInput", {
  isAbstract: true
})
export class EmployersOnAccountOrderByWithAggregationInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  accountId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  employerId?: "asc" | "desc" | undefined;

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

  @TypeGraphQL.Field(_type => EmployersOnAccountCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: EmployersOnAccountCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => EmployersOnAccountMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: EmployersOnAccountMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => EmployersOnAccountMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: EmployersOnAccountMinOrderByAggregateInput | undefined;
}
