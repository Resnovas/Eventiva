import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SubscriptionOnAccountCountAggregate } from '../outputs/SubscriptionOnAccountCountAggregate';
import { SubscriptionOnAccountMaxAggregate } from '../outputs/SubscriptionOnAccountMaxAggregate';
import { SubscriptionOnAccountMinAggregate } from '../outputs/SubscriptionOnAccountMinAggregate';

@TypeGraphQL.ObjectType('AggregateSubscriptionOnAccount', {
  isAbstract: true,
})
export class AggregateSubscriptionOnAccount {
  @TypeGraphQL.Field((_type) => SubscriptionOnAccountCountAggregate, {
    nullable: true,
  })
  _count!: SubscriptionOnAccountCountAggregate | null;

  @TypeGraphQL.Field((_type) => SubscriptionOnAccountMinAggregate, {
    nullable: true,
  })
  _min!: SubscriptionOnAccountMinAggregate | null;

  @TypeGraphQL.Field((_type) => SubscriptionOnAccountMaxAggregate, {
    nullable: true,
  })
  _max!: SubscriptionOnAccountMaxAggregate | null;
}
