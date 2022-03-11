import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { DeleteSIACheckArgs } from "./args/DeleteSIACheckArgs";
import { SIACheck } from "../../../models/SIACheck";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => SIACheck)
export class DeleteSIACheckResolver {
  @TypeGraphQL.Mutation(_returns => SIACheck, {
    nullable: true
  })
  async deleteSIACheck(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: DeleteSIACheckArgs): Promise<SIACheck | null> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).sIACheck.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
