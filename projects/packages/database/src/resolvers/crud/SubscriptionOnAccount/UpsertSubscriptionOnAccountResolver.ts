import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { UpsertSubscriptionOnAccountArgs } from './args/UpsertSubscriptionOnAccountArgs';
import { SubscriptionOnAccount } from '../../../models/SubscriptionOnAccount';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => SubscriptionOnAccount)
export class UpsertSubscriptionOnAccountResolver {
  @TypeGraphQL.Mutation((_returns) => SubscriptionOnAccount, {
    nullable: false,
  })
  async upsertSubscriptionOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpsertSubscriptionOnAccountArgs
  ): Promise<SubscriptionOnAccount> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).subscriptionOnAccount.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
