import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { UpsertManagersOnAccountArgs } from "./args/UpsertManagersOnAccountArgs";
import { ManagersOnAccount } from "../../../models/ManagersOnAccount";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => ManagersOnAccount)
export class UpsertManagersOnAccountResolver {
  @TypeGraphQL.Mutation(_returns => ManagersOnAccount, {
    nullable: false
  })
  async upsertManagersOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpsertManagersOnAccountArgs): Promise<ManagersOnAccount> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).managersOnAccount.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
