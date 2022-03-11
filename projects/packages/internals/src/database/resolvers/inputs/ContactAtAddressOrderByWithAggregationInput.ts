import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ContactAtAddressCountOrderByAggregateInput } from "../inputs/ContactAtAddressCountOrderByAggregateInput";
import { ContactAtAddressMaxOrderByAggregateInput } from "../inputs/ContactAtAddressMaxOrderByAggregateInput";
import { ContactAtAddressMinOrderByAggregateInput } from "../inputs/ContactAtAddressMinOrderByAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("ContactAtAddressOrderByWithAggregationInput", {
  isAbstract: true
})
export class ContactAtAddressOrderByWithAggregationInput {
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
  jobTitle?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  phone?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  emailId?: "asc" | "desc" | undefined;

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

  @TypeGraphQL.Field(_type => ContactAtAddressCountOrderByAggregateInput, {
    nullable: true
  })
  _count?: ContactAtAddressCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => ContactAtAddressMaxOrderByAggregateInput, {
    nullable: true
  })
  _max?: ContactAtAddressMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field(_type => ContactAtAddressMinOrderByAggregateInput, {
    nullable: true
  })
  _min?: ContactAtAddressMinOrderByAggregateInput | undefined;
}
