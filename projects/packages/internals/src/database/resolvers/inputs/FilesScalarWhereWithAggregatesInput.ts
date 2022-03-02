import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DateTimeNullableWithAggregatesFilter } from '../inputs/DateTimeNullableWithAggregatesFilter';
import { DateTimeWithAggregatesFilter } from '../inputs/DateTimeWithAggregatesFilter';
import { StringNullableWithAggregatesFilter } from '../inputs/StringNullableWithAggregatesFilter';
import { StringWithAggregatesFilter } from '../inputs/StringWithAggregatesFilter';

@TypeGraphQL.InputType('FilesScalarWhereWithAggregatesInput', {
  isAbstract: true,
})
export class FilesScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field((_type) => [FilesScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  AND?: FilesScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FilesScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  OR?: FilesScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FilesScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  NOT?: FilesScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => StringWithAggregatesFilter, {
    nullable: true,
  })
  id?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringWithAggregatesFilter, {
    nullable: true,
  })
  name?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableWithAggregatesFilter, {
    nullable: true,
  })
  rtwId?: StringNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeWithAggregatesFilter, {
    nullable: true,
  })
  createdAt?: DateTimeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeWithAggregatesFilter, {
    nullable: true,
  })
  updatedAt?: DateTimeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeNullableWithAggregatesFilter, {
    nullable: true,
  })
  deleted?: DateTimeNullableWithAggregatesFilter | undefined;
}
