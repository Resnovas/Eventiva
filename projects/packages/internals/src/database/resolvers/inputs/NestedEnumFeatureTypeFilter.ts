import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureType } from '../../enums/FeatureType';

@TypeGraphQL.InputType('NestedEnumFeatureTypeFilter', {
  isAbstract: true,
})
export class NestedEnumFeatureTypeFilter {
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
