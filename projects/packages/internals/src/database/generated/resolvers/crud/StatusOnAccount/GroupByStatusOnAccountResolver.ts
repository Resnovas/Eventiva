import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { GroupByStatusOnAccountArgs } from "./args/GroupByStatusOnAccountArgs";
import { StatusOnAccount } from "../../../models/StatusOnAccount";
import { StatusOnAccountGroupBy } from "../../outputs/StatusOnAccountGroupBy";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => StatusOnAccount)
export class GroupByStatusOnAccountResolver {
  @TypeGraphQL.Query(_returns => [StatusOnAccountGroupBy], {
    nullable: false
  })
  async groupByStatusOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: GroupByStatusOnAccountArgs): Promise<StatusOnAccountGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).statusOnAccount.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(([_, v]) => v != null)
      ),
    });
  }
}
