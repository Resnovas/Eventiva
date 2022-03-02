import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { BoolFilter } from '../inputs/BoolFilter';
import { DateTimeFilter } from '../inputs/DateTimeFilter';
import { DateTimeNullableFilter } from '../inputs/DateTimeNullableFilter';
import { EnumAccountTypeFilter } from '../inputs/EnumAccountTypeFilter';
import { EnumTitleNullableFilter } from '../inputs/EnumTitleNullableFilter';
import { StringFilter } from '../inputs/StringFilter';
import { StringNullableFilter } from '../inputs/StringNullableFilter';

@TypeGraphQL.InputType('AccountScalarWhereInput', {
  isAbstract: true,
})
export class AccountScalarWhereInput {
  @TypeGraphQL.Field((_type) => [AccountScalarWhereInput], {
    nullable: true,
  })
  AND?: AccountScalarWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [AccountScalarWhereInput], {
    nullable: true,
  })
  OR?: AccountScalarWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [AccountScalarWhereInput], {
    nullable: true,
  })
  NOT?: AccountScalarWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  id?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableFilter, {
    nullable: true,
  })
  username?: StringNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => EnumAccountTypeFilter, {
    nullable: true,
  })
  accountType?: EnumAccountTypeFilter | undefined;

  @TypeGraphQL.Field((_type) => BoolFilter, {
    nullable: true,
  })
  subsciption?: BoolFilter | undefined;

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
  lastLogin?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeNullableFilter, {
    nullable: true,
  })
  applied?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeNullableFilter, {
    nullable: true,
  })
  promoted?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeNullableFilter, {
    nullable: true,
  })
  retired?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => EnumTitleNullableFilter, {
    nullable: true,
  })
  title?: EnumTitleNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableFilter, {
    nullable: true,
  })
  firstname?: StringNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableFilter, {
    nullable: true,
  })
  midname?: StringNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableFilter, {
    nullable: true,
  })
  lastname?: StringNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableFilter, {
    nullable: true,
  })
  Salutation?: StringNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeNullableFilter, {
    nullable: true,
  })
  dob?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableFilter, {
    nullable: true,
  })
  sex?: StringNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  label?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableFilter, {
    nullable: true,
  })
  password?: StringNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableFilter, {
    nullable: true,
  })
  resetPasswordToken?: StringNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeNullableFilter, {
    nullable: true,
  })
  resetPasswordExpires?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeNullableFilter, {
    nullable: true,
  })
  deleted?: DateTimeNullableFilter | undefined;
}
