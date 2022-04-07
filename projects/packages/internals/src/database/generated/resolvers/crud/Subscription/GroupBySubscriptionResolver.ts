import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { GroupBySubscriptionArgs } from "./args/GroupBySubscriptionArgs";
import { Subscription } from "../../../models/Subscription";
import { SubscriptionGroupBy } from "../../outputs/SubscriptionGroupBy";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Subscription)
export class GroupBySubscriptionResolver {
  @TypeGraphQL.Query(_returns => [SubscriptionGroupBy], {
    nullable: false
  })
  async groupBySubscription(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: GroupBySubscriptionArgs): Promise<SubscriptionGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).subscription.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(([_, v]) => v != null)
      ),
    });
  }
}
