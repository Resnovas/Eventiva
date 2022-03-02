import * as TypeGraphQL from 'type-graphql';
import { Account } from '../../../models/Account';
import { Subscription } from '../../../models/Subscription';
import { SubscriptionOnAccount } from '../../../models/SubscriptionOnAccount';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => SubscriptionOnAccount)
export class SubscriptionOnAccountRelationsResolver {
  @TypeGraphQL.FieldResolver((_type) => Subscription, {
    nullable: false,
  })
  async subscription(
    @TypeGraphQL.Root() subscriptionOnAccount: SubscriptionOnAccount,
    @TypeGraphQL.Ctx() ctx: any
  ): Promise<Subscription> {
    return getPrismaFromContext(ctx)
      .subscriptionOnAccount.findUnique({
        where: {
          accountId_subscriptionId: {
            accountId: subscriptionOnAccount.accountId,
            subscriptionId: subscriptionOnAccount.subscriptionId,
          },
        },
      })
      .subscription({});
  }

  @TypeGraphQL.FieldResolver((_type) => Account, {
    nullable: false,
  })
  async account(
    @TypeGraphQL.Root() subscriptionOnAccount: SubscriptionOnAccount,
    @TypeGraphQL.Ctx() ctx: any
  ): Promise<Account> {
    return getPrismaFromContext(ctx)
      .subscriptionOnAccount.findUnique({
        where: {
          accountId_subscriptionId: {
            accountId: subscriptionOnAccount.accountId,
            subscriptionId: subscriptionOnAccount.subscriptionId,
          },
        },
      })
      .account({});
  }
}
