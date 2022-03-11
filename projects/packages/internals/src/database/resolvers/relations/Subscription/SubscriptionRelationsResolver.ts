import * as TypeGraphQL from "type-graphql";
import { Subscription } from "../../../models/Subscription";
import { SubscriptionOnAccount } from "../../../models/SubscriptionOnAccount";
import { SubscriptionAccountsArgs } from "./args/SubscriptionAccountsArgs";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Subscription)
export class SubscriptionRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => [SubscriptionOnAccount], {
    nullable: false
  })
  async accounts(@TypeGraphQL.Root() subscription: Subscription, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: SubscriptionAccountsArgs): Promise<SubscriptionOnAccount[]> {
    return getPrismaFromContext(ctx).subscription.findUnique({
      where: {
        id: subscription.id,
      },
    }).accounts(args);
  }
}
