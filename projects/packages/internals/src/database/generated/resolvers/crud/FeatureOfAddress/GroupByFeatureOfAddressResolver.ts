import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { GroupByFeatureOfAddressArgs } from "./args/GroupByFeatureOfAddressArgs";
import { FeatureOfAddress } from "../../../models/FeatureOfAddress";
import { FeatureOfAddressGroupBy } from "../../outputs/FeatureOfAddressGroupBy";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => FeatureOfAddress)
export class GroupByFeatureOfAddressResolver {
  @TypeGraphQL.Query(_returns => [FeatureOfAddressGroupBy], {
    nullable: false
  })
  async groupByFeatureOfAddress(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: GroupByFeatureOfAddressArgs): Promise<FeatureOfAddressGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).featureOfAddress.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(([_, v]) => v != null)
      ),
    });
  }
}
