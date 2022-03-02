import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { AggregateSubscriptionArgs } from './args/AggregateSubscriptionArgs';
import { Subscription } from '../../../models/Subscription';
import { AggregateSubscription } from '../../outputs/AggregateSubscription';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => Subscription)
export class AggregateSubscriptionResolver {
  @TypeGraphQL.Query((_returns) => AggregateSubscription, {
    nullable: false,
  })
  async aggregateSubscription(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: AggregateSubscriptionArgs
  ): Promise<AggregateSubscription> {
    return getPrismaFromContext(ctx).subscription.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
