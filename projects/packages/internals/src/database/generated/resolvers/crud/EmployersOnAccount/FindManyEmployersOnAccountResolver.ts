import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { FindManyEmployersOnAccountArgs } from "./args/FindManyEmployersOnAccountArgs";
import { EmployersOnAccount } from "../../../models/EmployersOnAccount";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => EmployersOnAccount)
export class FindManyEmployersOnAccountResolver {
  @TypeGraphQL.Query(_returns => [EmployersOnAccount], {
    nullable: false
  })
  async employersOnAccounts(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindManyEmployersOnAccountArgs): Promise<EmployersOnAccount[]> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).employersOnAccount.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
