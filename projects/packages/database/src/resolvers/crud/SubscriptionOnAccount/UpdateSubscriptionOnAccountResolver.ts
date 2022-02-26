import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { UpdateSubscriptionOnAccountArgs } from './args/UpdateSubscriptionOnAccountArgs';
import { SubscriptionOnAccount } from '../../../models/SubscriptionOnAccount';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => SubscriptionOnAccount)
export class UpdateSubscriptionOnAccountResolver {
  @TypeGraphQL.Mutation((_returns) => SubscriptionOnAccount, {
    nullable: true,
  })
  async updateSubscriptionOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpdateSubscriptionOnAccountArgs
  ): Promise<SubscriptionOnAccount | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).subscriptionOnAccount.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
