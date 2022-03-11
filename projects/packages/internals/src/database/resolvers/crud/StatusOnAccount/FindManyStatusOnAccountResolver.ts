import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { FindManyStatusOnAccountArgs } from "./args/FindManyStatusOnAccountArgs";
import { StatusOnAccount } from "../../../models/StatusOnAccount";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => StatusOnAccount)
export class FindManyStatusOnAccountResolver {
  @TypeGraphQL.Query(_returns => [StatusOnAccount], {
    nullable: false
  })
  async statusOnAccounts(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindManyStatusOnAccountArgs): Promise<StatusOnAccount[]> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).statusOnAccount.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
