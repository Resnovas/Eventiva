import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DateTimeNullableWithAggregatesFilter } from '../inputs/DateTimeNullableWithAggregatesFilter';
import { DateTimeWithAggregatesFilter } from '../inputs/DateTimeWithAggregatesFilter';
import { JsonNullableWithAggregatesFilter } from '../inputs/JsonNullableWithAggregatesFilter';
import { StringWithAggregatesFilter } from '../inputs/StringWithAggregatesFilter';

@TypeGraphQL.InputType('FeatureOfRoomScalarWhereWithAggregatesInput', {
  isAbstract: true,
})
export class FeatureOfRoomScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field((_type) => [FeatureOfRoomScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  AND?: FeatureOfRoomScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FeatureOfRoomScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  OR?: FeatureOfRoomScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FeatureOfRoomScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  NOT?: FeatureOfRoomScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => StringWithAggregatesFilter, {
    nullable: true,
  })
  roomId?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringWithAggregatesFilter, {
    nullable: true,
  })
  featureId?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => JsonNullableWithAggregatesFilter, {
    nullable: true,
  })
  data?: JsonNullableWithAggregatesFilter | undefined;

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
