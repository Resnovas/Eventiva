import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { AggregateSubscriptionOnAccountArgs } from "./args/AggregateSubscriptionOnAccountArgs";
import { SubscriptionOnAccount } from "../../../models/SubscriptionOnAccount";
import { AggregateSubscriptionOnAccount } from "../../outputs/AggregateSubscriptionOnAccount";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => SubscriptionOnAccount)
export class AggregateSubscriptionOnAccountResolver {
  @TypeGraphQL.Query(_returns => AggregateSubscriptionOnAccount, {
    nullable: false
  })
  async aggregateSubscriptionOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateSubscriptionOnAccountArgs): Promise<AggregateSubscriptionOnAccount> {
    return getPrismaFromContext(ctx).subscriptionOnAccount.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
