import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountRelationFilter } from '../inputs/AccountRelationFilter';
import { AddressRelationFilter } from '../inputs/AddressRelationFilter';
import { BoolFilter } from '../inputs/BoolFilter';
import { DateTimeFilter } from '../inputs/DateTimeFilter';
import { DateTimeNullableFilter } from '../inputs/DateTimeNullableFilter';
import { StringFilter } from '../inputs/StringFilter';

@TypeGraphQL.InputType('PhoneWhereInput', {
  isAbstract: true,
})
export class PhoneWhereInput {
  @TypeGraphQL.Field((_type) => [PhoneWhereInput], {
    nullable: true,
  })
  AND?: PhoneWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [PhoneWhereInput], {
    nullable: true,
  })
  OR?: PhoneWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [PhoneWhereInput], {
    nullable: true,
  })
  NOT?: PhoneWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  id?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFilter, {
    nullable: true,
  })
  createdAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFilter, {
    nullable: true,
  })
  updatedAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeNullableFilter, {
    nullable: true,
  })
  deleted?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => AccountRelationFilter, {
    nullable: true,
  })
  account?: AccountRelationFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  accountId?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => AddressRelationFilter, {
    nullable: true,
  })
  address?: AddressRelationFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  addressId?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  phone?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => BoolFilter, {
    nullable: true,
  })
  public?: BoolFilter | undefined;
}
