import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { UpsertSubscriptionArgs } from './args/UpsertSubscriptionArgs';
import { Subscription } from '../../../models/Subscription';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => Subscription)
export class UpsertSubscriptionResolver {
  @TypeGraphQL.Mutation((_returns) => Subscription, {
    nullable: false,
  })
  async upsertSubscription(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpsertSubscriptionArgs
  ): Promise<Subscription> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).subscription.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
