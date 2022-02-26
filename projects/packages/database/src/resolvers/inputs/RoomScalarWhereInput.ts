import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { BoolNullableFilter } from '../inputs/BoolNullableFilter';
import { DateTimeFilter } from '../inputs/DateTimeFilter';
import { DateTimeNullableFilter } from '../inputs/DateTimeNullableFilter';
import { StringFilter } from '../inputs/StringFilter';
import { StringNullableFilter } from '../inputs/StringNullableFilter';

@TypeGraphQL.InputType('RoomScalarWhereInput', {
  isAbstract: true,
})
export class RoomScalarWhereInput {
  @TypeGraphQL.Field((_type) => [RoomScalarWhereInput], {
    nullable: true,
  })
  AND?: RoomScalarWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [RoomScalarWhereInput], {
    nullable: true,
  })
  OR?: RoomScalarWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [RoomScalarWhereInput], {
    nullable: true,
  })
  NOT?: RoomScalarWhereInput[] | undefined;

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

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  addressId?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  name?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableFilter, {
    nullable: true,
  })
  floor?: StringNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableFilter, {
    nullable: true,
  })
  building?: StringNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => BoolNullableFilter, {
    nullable: true,
  })
  accessibility?: BoolNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeNullableFilter, {
    nullable: true,
  })
  checkin?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeNullableFilter, {
    nullable: true,
  })
  checkout?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableFilter, {
    nullable: true,
  })
  length?: StringNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableFilter, {
    nullable: true,
  })
  width?: StringNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableFilter, {
    nullable: true,
  })
  height?: StringNullableFilter | undefined;
}
