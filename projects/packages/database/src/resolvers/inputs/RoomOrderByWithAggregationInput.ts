import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { RoomCountOrderByAggregateInput } from '../inputs/RoomCountOrderByAggregateInput';
import { RoomMaxOrderByAggregateInput } from '../inputs/RoomMaxOrderByAggregateInput';
import { RoomMinOrderByAggregateInput } from '../inputs/RoomMinOrderByAggregateInput';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('RoomOrderByWithAggregationInput', {
  isAbstract: true,
})
export class RoomOrderByWithAggregationInput {
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
  deleted?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  addressId?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  name?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  floor?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  building?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  accessibility?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  checkin?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  checkout?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  length?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  width?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  height?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => RoomCountOrderByAggregateInput, {
    nullable: true,
  })
  _count?: RoomCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => RoomMaxOrderByAggregateInput, {
    nullable: true,
  })
  _max?: RoomMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => RoomMinOrderByAggregateInput, {
    nullable: true,
  })
  _min?: RoomMinOrderByAggregateInput | undefined;
}
