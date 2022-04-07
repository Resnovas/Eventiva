import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { BoolNullableWithAggregatesFilter } from "../inputs/BoolNullableWithAggregatesFilter";
import { DateTimeNullableWithAggregatesFilter } from "../inputs/DateTimeNullableWithAggregatesFilter";
import { DateTimeWithAggregatesFilter } from "../inputs/DateTimeWithAggregatesFilter";
import { StringNullableWithAggregatesFilter } from "../inputs/StringNullableWithAggregatesFilter";
import { StringWithAggregatesFilter } from "../inputs/StringWithAggregatesFilter";

@TypeGraphQL.InputType("ContactAtAddressScalarWhereWithAggregatesInput", {
  isAbstract: true
})
export class ContactAtAddressScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field(_type => [ContactAtAddressScalarWhereWithAggregatesInput], {
    nullable: true
  })
  AND?: ContactAtAddressScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [ContactAtAddressScalarWhereWithAggregatesInput], {
    nullable: true
  })
  OR?: ContactAtAddressScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [ContactAtAddressScalarWhereWithAggregatesInput], {
    nullable: true
  })
  NOT?: ContactAtAddressScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  accountId?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  addressId?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableWithAggregatesFilter, {
    nullable: true
  })
  jobTitle?: StringNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableWithAggregatesFilter, {
    nullable: true
  })
  phone?: StringNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableWithAggregatesFilter, {
    nullable: true
  })
  emailId?: StringNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeWithAggregatesFilter, {
    nullable: true
  })
  createdAt?: DateTimeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeWithAggregatesFilter, {
    nullable: true
  })
  updatedAt?: DateTimeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeNullableWithAggregatesFilter, {
    nullable: true
  })
  deletedDate?: DateTimeNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => BoolNullableWithAggregatesFilter, {
    nullable: true
  })
  deleted?: BoolNullableWithAggregatesFilter | undefined;
}
