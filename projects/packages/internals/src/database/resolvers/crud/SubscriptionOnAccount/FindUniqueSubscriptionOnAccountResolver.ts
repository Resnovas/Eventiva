import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { FindUniqueSubscriptionOnAccountArgs } from "./args/FindUniqueSubscriptionOnAccountArgs";
import { SubscriptionOnAccount } from "../../../models/SubscriptionOnAccount";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => SubscriptionOnAccount)
export class FindUniqueSubscriptionOnAccountResolver {
  @TypeGraphQL.Query(_returns => SubscriptionOnAccount, {
    nullable: true
  })
  async subscriptionOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindUniqueSubscriptionOnAccountArgs): Promise<SubscriptionOnAccount | null> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).subscriptionOnAccount.findUnique({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
