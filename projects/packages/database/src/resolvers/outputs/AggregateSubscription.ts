import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SubscriptionCountAggregate } from '../outputs/SubscriptionCountAggregate';
import { SubscriptionMaxAggregate } from '../outputs/SubscriptionMaxAggregate';
import { SubscriptionMinAggregate } from '../outputs/SubscriptionMinAggregate';

@TypeGraphQL.ObjectType('AggregateSubscription', {
  isAbstract: true,
})
export class AggregateSubscription {
  @TypeGraphQL.Field((_type) => SubscriptionCountAggregate, {
    nullable: true,
  })
  _count!: SubscriptionCountAggregate | null;

  @TypeGraphQL.Field((_type) => SubscriptionMinAggregate, {
    nullable: true,
  })
  _min!: SubscriptionMinAggregate | null;

  @TypeGraphQL.Field((_type) => SubscriptionMaxAggregate, {
    nullable: true,
  })
  _max!: SubscriptionMaxAggregate | null;
}
