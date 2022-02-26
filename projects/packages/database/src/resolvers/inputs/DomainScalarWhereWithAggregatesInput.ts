import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { BoolWithAggregatesFilter } from '../inputs/BoolWithAggregatesFilter';
import { DateTimeNullableWithAggregatesFilter } from '../inputs/DateTimeNullableWithAggregatesFilter';
import { DateTimeWithAggregatesFilter } from '../inputs/DateTimeWithAggregatesFilter';
import { EnumdnsTypeWithAggregatesFilter } from '../inputs/EnumdnsTypeWithAggregatesFilter';
import { JsonWithAggregatesFilter } from '../inputs/JsonWithAggregatesFilter';
import { StringWithAggregatesFilter } from '../inputs/StringWithAggregatesFilter';

@TypeGraphQL.InputType('DomainScalarWhereWithAggregatesInput', {
  isAbstract: true,
})
export class DomainScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field((_type) => [DomainScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  AND?: DomainScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [DomainScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  OR?: DomainScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [DomainScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  NOT?: DomainScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => StringWithAggregatesFilter, {
    nullable: true,
  })
  id?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringWithAggregatesFilter, {
    nullable: true,
  })
  domain?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => BoolWithAggregatesFilter, {
    nullable: true,
  })
  verified?: BoolWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => EnumdnsTypeWithAggregatesFilter, {
    nullable: true,
  })
  dnsType?: EnumdnsTypeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => JsonWithAggregatesFilter, {
    nullable: true,
  })
  data?: JsonWithAggregatesFilter | undefined;

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
