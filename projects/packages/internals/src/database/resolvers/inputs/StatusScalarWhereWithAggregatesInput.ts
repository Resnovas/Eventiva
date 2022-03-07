import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DateTimeNullableWithAggregatesFilter } from '../inputs/DateTimeNullableWithAggregatesFilter';
import { DateTimeWithAggregatesFilter } from '../inputs/DateTimeWithAggregatesFilter';
import { StringWithAggregatesFilter } from '../inputs/StringWithAggregatesFilter';

@TypeGraphQL.InputType('StatusScalarWhereWithAggregatesInput', {
  isAbstract: true,
})
export class StatusScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field((_type) => [StatusScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  AND?: StatusScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [StatusScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  OR?: StatusScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [StatusScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  NOT?: StatusScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => StringWithAggregatesFilter, {
    nullable: true,
  })
  id?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringWithAggregatesFilter, {
    nullable: true,
  })
  name?: StringWithAggregatesFilter | undefined;

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
