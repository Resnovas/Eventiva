import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { GroupBySubscriptionOnAccountArgs } from "./args/GroupBySubscriptionOnAccountArgs";
import { SubscriptionOnAccount } from "../../../models/SubscriptionOnAccount";
import { SubscriptionOnAccountGroupBy } from "../../outputs/SubscriptionOnAccountGroupBy";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => SubscriptionOnAccount)
export class GroupBySubscriptionOnAccountResolver {
  @TypeGraphQL.Query(_returns => [SubscriptionOnAccountGroupBy], {
    nullable: false
  })
  async groupBySubscriptionOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: GroupBySubscriptionOnAccountArgs): Promise<SubscriptionOnAccountGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).subscriptionOnAccount.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(([_, v]) => v != null)
      ),
    });
  }
}
