import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { BoolNullableWithAggregatesFilter } from '../inputs/BoolNullableWithAggregatesFilter';
import { BoolWithAggregatesFilter } from '../inputs/BoolWithAggregatesFilter';
import { DateTimeNullableWithAggregatesFilter } from '../inputs/DateTimeNullableWithAggregatesFilter';
import { DateTimeWithAggregatesFilter } from '../inputs/DateTimeWithAggregatesFilter';
import { EnumAddressTypeWithAggregatesFilter } from '../inputs/EnumAddressTypeWithAggregatesFilter';
import { JsonNullableWithAggregatesFilter } from '../inputs/JsonNullableWithAggregatesFilter';
import { StringNullableWithAggregatesFilter } from '../inputs/StringNullableWithAggregatesFilter';
import { StringWithAggregatesFilter } from '../inputs/StringWithAggregatesFilter';

@TypeGraphQL.InputType('AddressScalarWhereWithAggregatesInput', {
  isAbstract: true,
})
export class AddressScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field((_type) => [AddressScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  AND?: AddressScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [AddressScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  OR?: AddressScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [AddressScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  NOT?: AddressScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => StringWithAggregatesFilter, {
    nullable: true,
  })
  id?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeWithAggregatesFilter, {
    nullable: true,
  })
  createdAt?: DateTimeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeWithAggregatesFilter, {
    nullable: true,
  })
  updatedAt?: DateTimeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringWithAggregatesFilter, {
    nullable: true,
  })
  accountId?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => EnumAddressTypeWithAggregatesFilter, {
    nullable: true,
  })
  type?: EnumAddressTypeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableWithAggregatesFilter, {
    nullable: true,
  })
  coords?: StringNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringWithAggregatesFilter, {
    nullable: true,
  })
  street?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableWithAggregatesFilter, {
    nullable: true,
  })
  city?: StringNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableWithAggregatesFilter, {
    nullable: true,
  })
  state?: StringNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableWithAggregatesFilter, {
    nullable: true,
  })
  country?: StringNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableWithAggregatesFilter, {
    nullable: true,
  })
  zipcode?: StringNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableWithAggregatesFilter, {
    nullable: true,
  })
  addressName?: StringNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableWithAggregatesFilter, {
    nullable: true,
  })
  name?: StringNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => BoolNullableWithAggregatesFilter, {
    nullable: true,
  })
  parking?: BoolNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableWithAggregatesFilter, {
    nullable: true,
  })
  website?: StringNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => JsonNullableWithAggregatesFilter, {
    nullable: true,
  })
  hoursOfOperation?: JsonNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringWithAggregatesFilter, {
    nullable: true,
  })
  features?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => JsonNullableWithAggregatesFilter, {
    nullable: true,
  })
  details?: JsonNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => BoolWithAggregatesFilter, {
    nullable: true,
  })
  public?: BoolWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableWithAggregatesFilter, {
    nullable: true,
  })
  primaryaccountId?: StringNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeNullableWithAggregatesFilter, {
    nullable: true,
  })
  deleted?: DateTimeNullableWithAggregatesFilter | undefined;
}
