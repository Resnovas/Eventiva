import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DateTimeFilter } from '../inputs/DateTimeFilter';
import { DateTimeNullableFilter } from '../inputs/DateTimeNullableFilter';
import { EnumFeatureTypeFilter } from '../inputs/EnumFeatureTypeFilter';
import { FeatureOfAddressListRelationFilter } from '../inputs/FeatureOfAddressListRelationFilter';
import { FeatureOfRoomListRelationFilter } from '../inputs/FeatureOfRoomListRelationFilter';
import { StringFilter } from '../inputs/StringFilter';

@TypeGraphQL.InputType('FeatureWhereInput', {
  isAbstract: true,
})
export class FeatureWhereInput {
  @TypeGraphQL.Field((_type) => [FeatureWhereInput], {
    nullable: true,
  })
  AND?: FeatureWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FeatureWhereInput], {
    nullable: true,
  })
  OR?: FeatureWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FeatureWhereInput], {
    nullable: true,
  })
  NOT?: FeatureWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  id?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  name?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => EnumFeatureTypeFilter, {
    nullable: true,
  })
  type?: EnumFeatureTypeFilter | undefined;

  @TypeGraphQL.Field((_type) => FeatureOfRoomListRelationFilter, {
    nullable: true,
  })
  featureOfRoom?: FeatureOfRoomListRelationFilter | undefined;

  @TypeGraphQL.Field((_type) => FeatureOfAddressListRelationFilter, {
    nullable: true,
  })
  featureOfAddress?: FeatureOfAddressListRelationFilter | undefined;

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
