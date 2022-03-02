import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DateTimeFilter } from '../inputs/DateTimeFilter';
import { DateTimeNullableFilter } from '../inputs/DateTimeNullableFilter';
import { StringFilter } from '../inputs/StringFilter';
import { StringNullableFilter } from '../inputs/StringNullableFilter';

@TypeGraphQL.InputType('FilesScalarWhereInput', {
  isAbstract: true,
})
export class FilesScalarWhereInput {
  @TypeGraphQL.Field((_type) => [FilesScalarWhereInput], {
    nullable: true,
  })
  AND?: FilesScalarWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FilesScalarWhereInput], {
    nullable: true,
  })
  OR?: FilesScalarWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FilesScalarWhereInput], {
    nullable: true,
  })
  NOT?: FilesScalarWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  id?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  name?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableFilter, {
    nullable: true,
  })
  rtwId?: StringNullableFilter | undefined;

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
}
