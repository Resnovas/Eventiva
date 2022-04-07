import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { UpdateSIABadgeArgs } from "./args/UpdateSIABadgeArgs";
import { SIABadge } from "../../../models/SIABadge";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => SIABadge)
export class UpdateSIABadgeResolver {
  @TypeGraphQL.Mutation(_returns => SIABadge, {
    nullable: true
  })
  async updateSIABadge(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpdateSIABadgeArgs): Promise<SIABadge | null> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).sIABadge.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
