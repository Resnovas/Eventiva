import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { BoolWithAggregatesFilter } from '../inputs/BoolWithAggregatesFilter';
import { DateTimeWithAggregatesFilter } from '../inputs/DateTimeWithAggregatesFilter';
import { EnumTokenTypeWithAggregatesFilter } from '../inputs/EnumTokenTypeWithAggregatesFilter';
import { StringWithAggregatesFilter } from '../inputs/StringWithAggregatesFilter';

@TypeGraphQL.InputType('TokenScalarWhereWithAggregatesInput', {
  isAbstract: true,
})
export class TokenScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field((_type) => [TokenScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  AND?: TokenScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [TokenScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  OR?: TokenScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [TokenScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  NOT?: TokenScalarWhereWithAggregatesInput[] | undefined;

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

  @TypeGraphQL.Field((_type) => EnumTokenTypeWithAggregatesFilter, {
    nullable: true,
  })
  type?: EnumTokenTypeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringWithAggregatesFilter, {
    nullable: true,
  })
  value?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => BoolWithAggregatesFilter, {
    nullable: true,
  })
  valid?: BoolWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeWithAggregatesFilter, {
    nullable: true,
  })
  expiry?: DateTimeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringWithAggregatesFilter, {
    nullable: true,
  })
  apiToken?: StringWithAggregatesFilter | undefined;
}
