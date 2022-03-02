import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { DeleteSubscriptionArgs } from './args/DeleteSubscriptionArgs';
import { Subscription } from '../../../models/Subscription';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => Subscription)
export class DeleteSubscriptionResolver {
  @TypeGraphQL.Mutation((_returns) => Subscription, {
    nullable: true,
  })
  async deleteSubscription(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: DeleteSubscriptionArgs
  ): Promise<Subscription | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).subscription.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
