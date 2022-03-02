import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../scalars';
import { SubscriptionOnAccount } from '../models/SubscriptionOnAccount';
import { SubscriptionCount } from '../resolvers/outputs/SubscriptionCount';

@TypeGraphQL.ObjectType('Subscription', {
  isAbstract: true,
})
export class Subscription {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  id!: string;

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
  deleted?: Date | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  name?: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  cost?: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  details?: string | null;

  accounts?: SubscriptionOnAccount[];

  @TypeGraphQL.Field((_type) => SubscriptionCount, {
    nullable: true,
  })
  _count?: SubscriptionCount | null;
}
