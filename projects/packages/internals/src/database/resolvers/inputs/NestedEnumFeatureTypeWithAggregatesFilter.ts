import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { NestedEnumFeatureTypeFilter } from '../inputs/NestedEnumFeatureTypeFilter';
import { NestedIntFilter } from '../inputs/NestedIntFilter';
import { FeatureType } from '../../enums/FeatureType';

@TypeGraphQL.InputType('NestedEnumFeatureTypeWithAggregatesFilter', {
  isAbstract: true,
})
export class NestedEnumFeatureTypeWithAggregatesFilter {
  @TypeGraphQL.Field((_type) => FeatureType, {
    nullable: true,
  })
  equals?: 'STRING' | 'BOOLEAN' | 'NUMBER' | undefined;

  @TypeGraphQL.Field((_type) => [FeatureType], {
    nullable: true,
  })
  in?: Array<'STRING' | 'BOOLEAN' | 'NUMBER'> | undefined;

  @TypeGraphQL.Field((_type) => [FeatureType], {
    nullable: true,
  })
  notIn?: Array<'STRING' | 'BOOLEAN' | 'NUMBER'> | undefined;

  @TypeGraphQL.Field((_type) => NestedEnumFeatureTypeWithAggregatesFilter, {
    nullable: true,
  })
  not?: NestedEnumFeatureTypeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedIntFilter, {
    nullable: true,
  })
  _count?: NestedIntFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedEnumFeatureTypeFilter, {
    nullable: true,
  })
  _min?: NestedEnumFeatureTypeFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedEnumFeatureTypeFilter, {
    nullable: true,
  })
  _max?: NestedEnumFeatureTypeFilter | undefined;
}
