import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountOrderByWithRelationAndSearchRelevanceInput } from "../inputs/AccountOrderByWithRelationAndSearchRelevanceInput";
import { AddressOrderByWithRelationAndSearchRelevanceInput } from "../inputs/AddressOrderByWithRelationAndSearchRelevanceInput";
import { ContactAtAddressOrderByRelevanceInput } from "../inputs/ContactAtAddressOrderByRelevanceInput";
import { EmailOrderByWithRelationAndSearchRelevanceInput } from "../inputs/EmailOrderByWithRelationAndSearchRelevanceInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("ContactAtAddressOrderByWithRelationAndSearchRelevanceInput", {
  isAbstract: true
})
export class ContactAtAddressOrderByWithRelationAndSearchRelevanceInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  accountId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  addressId?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => AccountOrderByWithRelationAndSearchRelevanceInput, {
    nullable: true
  })
  account?: AccountOrderByWithRelationAndSearchRelevanceInput | undefined;

  @TypeGraphQL.Field(_type => AddressOrderByWithRelationAndSearchRelevanceInput, {
    nullable: true
  })
  address?: AddressOrderByWithRelationAndSearchRelevanceInput | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  jobTitle?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  phone?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => EmailOrderByWithRelationAndSearchRelevanceInput, {
    nullable: true
  })
  email?: EmailOrderByWithRelationAndSearchRelevanceInput | undefined;

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

  @TypeGraphQL.Field(_type => ContactAtAddressOrderByRelevanceInput, {
    nullable: true
  })
  _relevance?: ContactAtAddressOrderByRelevanceInput | undefined;
}
