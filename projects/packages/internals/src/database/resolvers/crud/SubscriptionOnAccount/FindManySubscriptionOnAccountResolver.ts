import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { FindManySubscriptionOnAccountArgs } from "./args/FindManySubscriptionOnAccountArgs";
import { SubscriptionOnAccount } from "../../../models/SubscriptionOnAccount";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => SubscriptionOnAccount)
export class FindManySubscriptionOnAccountResolver {
  @TypeGraphQL.Query(_returns => [SubscriptionOnAccount], {
    nullable: false
  })
  async subscriptionOnAccounts(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindManySubscriptionOnAccountArgs): Promise<SubscriptionOnAccount[]> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).subscriptionOnAccount.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
