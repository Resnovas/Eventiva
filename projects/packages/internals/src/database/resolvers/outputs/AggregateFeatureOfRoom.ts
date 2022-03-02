import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureOfRoomCountAggregate } from '../outputs/FeatureOfRoomCountAggregate';
import { FeatureOfRoomMaxAggregate } from '../outputs/FeatureOfRoomMaxAggregate';
import { FeatureOfRoomMinAggregate } from '../outputs/FeatureOfRoomMinAggregate';

@TypeGraphQL.ObjectType('AggregateFeatureOfRoom', {
  isAbstract: true,
})
export class AggregateFeatureOfRoom {
  @TypeGraphQL.Field((_type) => FeatureOfRoomCountAggregate, {
    nullable: true,
  })
  _count!: FeatureOfRoomCountAggregate | null;

  @TypeGraphQL.Field((_type) => FeatureOfRoomMinAggregate, {
    nullable: true,
  })
  _min!: FeatureOfRoomMinAggregate | null;

  @TypeGraphQL.Field((_type) => FeatureOfRoomMaxAggregate, {
    nullable: true,
  })
  _max!: FeatureOfRoomMaxAggregate | null;
}
