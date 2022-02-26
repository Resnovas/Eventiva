import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SubscriptionOnAccountCountAggregate } from '../outputs/SubscriptionOnAccountCountAggregate';
import { SubscriptionOnAccountMaxAggregate } from '../outputs/SubscriptionOnAccountMaxAggregate';
import { SubscriptionOnAccountMinAggregate } from '../outputs/SubscriptionOnAccountMinAggregate';

@TypeGraphQL.ObjectType('SubscriptionOnAccountGroupBy', {
  isAbstract: true,
})
export class SubscriptionOnAccountGroupBy {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  subscriptionId!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  accountId!: string;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: false,
  })
  active!: boolean;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  deactivated!: Date | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  activated!: Date | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  startedAt!: Date | null;

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
