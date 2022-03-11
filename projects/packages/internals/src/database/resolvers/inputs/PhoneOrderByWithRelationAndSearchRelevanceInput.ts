import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountOrderByWithRelationAndSearchRelevanceInput } from "../inputs/AccountOrderByWithRelationAndSearchRelevanceInput";
import { AddressOrderByWithRelationAndSearchRelevanceInput } from "../inputs/AddressOrderByWithRelationAndSearchRelevanceInput";
import { PhoneOrderByRelevanceInput } from "../inputs/PhoneOrderByRelevanceInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("PhoneOrderByWithRelationAndSearchRelevanceInput", {
  isAbstract: true
})
export class PhoneOrderByWithRelationAndSearchRelevanceInput {
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
  deleted?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => AccountOrderByWithRelationAndSearchRelevanceInput, {
    nullable: true
  })
  account?: AccountOrderByWithRelationAndSearchRelevanceInput | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  accountId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => AddressOrderByWithRelationAndSearchRelevanceInput, {
    nullable: true
  })
  address?: AddressOrderByWithRelationAndSearchRelevanceInput | undefined;

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

  @TypeGraphQL.Field(_type => PhoneOrderByRelevanceInput, {
    nullable: true
  })
  _relevance?: PhoneOrderByRelevanceInput | undefined;
}
