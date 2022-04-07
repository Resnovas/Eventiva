import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { GroupByFeatureArgs } from "./args/GroupByFeatureArgs";
import { Feature } from "../../../models/Feature";
import { FeatureGroupBy } from "../../outputs/FeatureGroupBy";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Feature)
export class GroupByFeatureResolver {
  @TypeGraphQL.Query(_returns => [FeatureGroupBy], {
    nullable: false
  })
  async groupByFeature(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: GroupByFeatureArgs): Promise<FeatureGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).feature.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(([_, v]) => v != null)
      ),
    });
  }
}
