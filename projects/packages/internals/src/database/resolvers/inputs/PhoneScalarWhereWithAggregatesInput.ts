import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { BoolWithAggregatesFilter } from "../inputs/BoolWithAggregatesFilter";
import { DateTimeNullableWithAggregatesFilter } from "../inputs/DateTimeNullableWithAggregatesFilter";
import { DateTimeWithAggregatesFilter } from "../inputs/DateTimeWithAggregatesFilter";
import { StringWithAggregatesFilter } from "../inputs/StringWithAggregatesFilter";

@TypeGraphQL.InputType("PhoneScalarWhereWithAggregatesInput", {
  isAbstract: true
})
export class PhoneScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field(_type => [PhoneScalarWhereWithAggregatesInput], {
    nullable: true
  })
  AND?: PhoneScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [PhoneScalarWhereWithAggregatesInput], {
    nullable: true
  })
  OR?: PhoneScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [PhoneScalarWhereWithAggregatesInput], {
    nullable: true
  })
  NOT?: PhoneScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  id?: StringWithAggregatesFilter | undefined;

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
  deleted?: DateTimeNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  accountId?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  addressId?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  phone?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => BoolWithAggregatesFilter, {
    nullable: true
  })
  public?: BoolWithAggregatesFilter | undefined;
}
