import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DateTimeFilter } from '../inputs/DateTimeFilter';
import { DateTimeNullableFilter } from '../inputs/DateTimeNullableFilter';
import { FeatureRelationFilter } from '../inputs/FeatureRelationFilter';
import { JsonNullableFilter } from '../inputs/JsonNullableFilter';
import { RoomRelationFilter } from '../inputs/RoomRelationFilter';
import { StringFilter } from '../inputs/StringFilter';

@TypeGraphQL.InputType('FeatureOfRoomWhereInput', {
  isAbstract: true,
})
export class FeatureOfRoomWhereInput {
  @TypeGraphQL.Field((_type) => [FeatureOfRoomWhereInput], {
    nullable: true,
  })
  AND?: FeatureOfRoomWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FeatureOfRoomWhereInput], {
    nullable: true,
  })
  OR?: FeatureOfRoomWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FeatureOfRoomWhereInput], {
    nullable: true,
  })
  NOT?: FeatureOfRoomWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  roomId?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  featureId?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => FeatureRelationFilter, {
    nullable: true,
  })
  feature?: FeatureRelationFilter | undefined;

  @TypeGraphQL.Field((_type) => RoomRelationFilter, {
    nullable: true,
  })
  room?: RoomRelationFilter | undefined;

  @TypeGraphQL.Field((_type) => JsonNullableFilter, {
    nullable: true,
  })
  data?: JsonNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFilter, {
    nullable: true,
  })
  createdAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFilter, {
    nullable: true,
  })
  updatedAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeNullableFilter, {
    nullable: true,
  })
  deleted?: DateTimeNullableFilter | undefined;
}
