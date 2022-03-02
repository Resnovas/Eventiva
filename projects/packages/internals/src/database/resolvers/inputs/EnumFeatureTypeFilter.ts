import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { NestedEnumFeatureTypeFilter } from '../inputs/NestedEnumFeatureTypeFilter';
import { FeatureType } from '../../enums/FeatureType';

@TypeGraphQL.InputType('EnumFeatureTypeFilter', {
  isAbstract: true,
})
export class EnumFeatureTypeFilter {
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

  @TypeGraphQL.Field((_type) => NestedEnumFeatureTypeFilter, {
    nullable: true,
  })
  not?: NestedEnumFeatureTypeFilter | undefined;
}
