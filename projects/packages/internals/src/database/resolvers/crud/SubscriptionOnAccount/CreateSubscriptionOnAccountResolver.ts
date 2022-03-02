import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { CreateSubscriptionOnAccountArgs } from './args/CreateSubscriptionOnAccountArgs';
import { SubscriptionOnAccount } from '../../../models/SubscriptionOnAccount';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => SubscriptionOnAccount)
export class CreateSubscriptionOnAccountResolver {
  @TypeGraphQL.Mutation((_returns) => SubscriptionOnAccount, {
    nullable: false,
  })
  async createSubscriptionOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: CreateSubscriptionOnAccountArgs
  ): Promise<SubscriptionOnAccount> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).subscriptionOnAccount.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
