import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { UpdateSIACheckArgs } from "./args/UpdateSIACheckArgs";
import { SIACheck } from "../../../models/SIACheck";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => SIACheck)
export class UpdateSIACheckResolver {
  @TypeGraphQL.Mutation(_returns => SIACheck, {
    nullable: true
  })
  async updateSIACheck(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpdateSIACheckArgs): Promise<SIACheck | null> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).sIACheck.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
