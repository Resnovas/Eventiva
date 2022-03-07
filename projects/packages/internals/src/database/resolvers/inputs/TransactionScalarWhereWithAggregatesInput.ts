import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DateTimeNullableWithAggregatesFilter } from '../inputs/DateTimeNullableWithAggregatesFilter';
import { DateTimeWithAggregatesFilter } from '../inputs/DateTimeWithAggregatesFilter';
import { JsonWithAggregatesFilter } from '../inputs/JsonWithAggregatesFilter';
import { StringWithAggregatesFilter } from '../inputs/StringWithAggregatesFilter';

@TypeGraphQL.InputType('TransactionScalarWhereWithAggregatesInput', {
  isAbstract: true,
})
export class TransactionScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field((_type) => [TransactionScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  AND?: TransactionScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [TransactionScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  OR?: TransactionScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [TransactionScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  NOT?: TransactionScalarWhereWithAggregatesInput[] | undefined;

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

  @TypeGraphQL.Field((_type) => DateTimeNullableWithAggregatesFilter, {
    nullable: true,
  })
  deleted?: DateTimeNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringWithAggregatesFilter, {
    nullable: true,
  })
  accountId?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => JsonWithAggregatesFilter, {
    nullable: true,
  })
  data?: JsonWithAggregatesFilter | undefined;
}