import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PhoneCountOrderByAggregateInput } from "../inputs/PhoneCountOrderByAggregateInput";
import { PhoneMaxOrderByAggregateInput } from "../inputs/PhoneMaxOrderByAggregateInput";
import { PhoneMinOrderByAggregateInput } from "../inputs/PhoneMinOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("PhoneOrderByWithAggregationInput", {
  isAbstract: true
})
export class PhoneOrderByWithAggregationInput {
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
  deletedDate?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  deleted?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  accountId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  addressId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  phone?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  public?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => PhoneCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: PhoneCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => PhoneMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: PhoneMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => PhoneMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: PhoneMinOrderByAggregateInput | undefined;
}
