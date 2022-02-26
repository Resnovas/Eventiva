import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { StatusOnAccountCountOrderByAggregateInput } from '../inputs/StatusOnAccountCountOrderByAggregateInput';
import { StatusOnAccountMaxOrderByAggregateInput } from '../inputs/StatusOnAccountMaxOrderByAggregateInput';
import { StatusOnAccountMinOrderByAggregateInput } from '../inputs/StatusOnAccountMinOrderByAggregateInput';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('StatusOnAccountOrderByWithAggregationInput', {
  isAbstract: true,
})
export class StatusOnAccountOrderByWithAggregationInput {
  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  statusId?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  accountId?: 'asc' | 'desc' | undefined;

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

  @TypeGraphQL.Field((_type) => StatusOnAccountCountOrderByAggregateInput, {
    nullable: true,
  })
  _count?: StatusOnAccountCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => StatusOnAccountMaxOrderByAggregateInput, {
    nullable: true,
  })
  _max?: StatusOnAccountMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => StatusOnAccountMinOrderByAggregateInput, {
    nullable: true,
  })
  _min?: StatusOnAccountMinOrderByAggregateInput | undefined;
}
