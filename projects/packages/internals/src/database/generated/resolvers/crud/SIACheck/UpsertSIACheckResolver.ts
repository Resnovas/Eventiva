import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { UpsertSIACheckArgs } from "./args/UpsertSIACheckArgs";
import { SIACheck } from "../../../models/SIACheck";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => SIACheck)
export class UpsertSIACheckResolver {
  @TypeGraphQL.Mutation(_returns => SIACheck, {
    nullable: false
  })
  async upsertSIACheck(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpsertSIACheckArgs): Promise<SIACheck> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).sIACheck.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
