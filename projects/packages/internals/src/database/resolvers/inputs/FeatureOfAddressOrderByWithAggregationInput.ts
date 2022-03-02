import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureOfAddressCountOrderByAggregateInput } from '../inputs/FeatureOfAddressCountOrderByAggregateInput';
import { FeatureOfAddressMaxOrderByAggregateInput } from '../inputs/FeatureOfAddressMaxOrderByAggregateInput';
import { FeatureOfAddressMinOrderByAggregateInput } from '../inputs/FeatureOfAddressMinOrderByAggregateInput';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('FeatureOfAddressOrderByWithAggregationInput', {
  isAbstract: true,
})
export class FeatureOfAddressOrderByWithAggregationInput {
  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  addressId?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  featureId?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  data?: 'asc' | 'desc' | undefined;

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

  @TypeGraphQL.Field((_type) => FeatureOfAddressCountOrderByAggregateInput, {
    nullable: true,
  })
  _count?: FeatureOfAddressCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => FeatureOfAddressMaxOrderByAggregateInput, {
    nullable: true,
  })
  _max?: FeatureOfAddressMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => FeatureOfAddressMinOrderByAggregateInput, {
    nullable: true,
  })
  _min?: FeatureOfAddressMinOrderByAggregateInput | undefined;
}
