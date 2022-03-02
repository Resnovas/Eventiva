import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureCountAggregate } from '../outputs/FeatureCountAggregate';
import { FeatureMaxAggregate } from '../outputs/FeatureMaxAggregate';
import { FeatureMinAggregate } from '../outputs/FeatureMinAggregate';
import { FeatureType } from '../../enums/FeatureType';

@TypeGraphQL.ObjectType('FeatureGroupBy', {
  isAbstract: true,
})
export class FeatureGroupBy {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  id!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  name!: string;

  @TypeGraphQL.Field((_type) => FeatureType, {
    nullable: false,
  })
  type!: 'STRING' | 'BOOLEAN' | 'NUMBER';

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  createdAt!: Date;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  updatedAt!: Date;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  deleted!: Date | null;

  @TypeGraphQL.Field((_type) => FeatureCountAggregate, {
    nullable: true,
  })
  _count!: FeatureCountAggregate | null;

  @TypeGraphQL.Field((_type) => FeatureMinAggregate, {
    nullable: true,
  })
  _min!: FeatureMinAggregate | null;

  @TypeGraphQL.Field((_type) => FeatureMaxAggregate, {
    nullable: true,
  })
  _max!: FeatureMaxAggregate | null;
}
