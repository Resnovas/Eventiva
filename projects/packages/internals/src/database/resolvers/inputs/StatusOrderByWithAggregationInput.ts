import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { StatusCountOrderByAggregateInput } from '../inputs/StatusCountOrderByAggregateInput';
import { StatusMaxOrderByAggregateInput } from '../inputs/StatusMaxOrderByAggregateInput';
import { StatusMinOrderByAggregateInput } from '../inputs/StatusMinOrderByAggregateInput';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('StatusOrderByWithAggregationInput', {
  isAbstract: true,
})
export class StatusOrderByWithAggregationInput {
  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  id?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  name?: 'asc' | 'desc' | undefined;

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
  deleted?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => StatusCountOrderByAggregateInput, {
    nullable: true,
  })
  _count?: StatusCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => StatusMaxOrderByAggregateInput, {
    nullable: true,
  })
  _max?: StatusMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => StatusMinOrderByAggregateInput, {
    nullable: true,
  })
  _min?: StatusMinOrderByAggregateInput | undefined;
}
