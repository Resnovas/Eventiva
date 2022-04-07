import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { FindManySubuserOnAccountArgs } from "./args/FindManySubuserOnAccountArgs";
import { SubuserOnAccount } from "../../../models/SubuserOnAccount";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => SubuserOnAccount)
export class FindManySubuserOnAccountResolver {
  @TypeGraphQL.Query(_returns => [SubuserOnAccount], {
    nullable: false
  })
  async subuserOnAccounts(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindManySubuserOnAccountArgs): Promise<SubuserOnAccount[]> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).subuserOnAccount.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
