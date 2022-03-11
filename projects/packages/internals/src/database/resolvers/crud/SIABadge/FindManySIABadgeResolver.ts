import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { FindManySIABadgeArgs } from "./args/FindManySIABadgeArgs";
import { SIABadge } from "../../../models/SIABadge";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => SIABadge)
export class FindManySIABadgeResolver {
  @TypeGraphQL.Query(_returns => [SIABadge], {
    nullable: false
  })
  async sIABadges(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindManySIABadgeArgs): Promise<SIABadge[]> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).sIABadge.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
