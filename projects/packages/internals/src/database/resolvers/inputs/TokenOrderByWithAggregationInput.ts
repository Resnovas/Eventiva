import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { TokenCountOrderByAggregateInput } from '../inputs/TokenCountOrderByAggregateInput';
import { TokenMaxOrderByAggregateInput } from '../inputs/TokenMaxOrderByAggregateInput';
import { TokenMinOrderByAggregateInput } from '../inputs/TokenMinOrderByAggregateInput';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('TokenOrderByWithAggregationInput', {
  isAbstract: true,
})
export class TokenOrderByWithAggregationInput {
  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  id?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  createdAt?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  updatedAt?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  type?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  value?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  valid?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  expiry?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  apiToken?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => TokenCountOrderByAggregateInput, {
    nullable: true,
  })
  _count?: TokenCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => TokenMaxOrderByAggregateInput, {
    nullable: true,
  })
  _max?: TokenMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => TokenMinOrderByAggregateInput, {
    nullable: true,
  })
  _min?: TokenMinOrderByAggregateInput | undefined;
}
