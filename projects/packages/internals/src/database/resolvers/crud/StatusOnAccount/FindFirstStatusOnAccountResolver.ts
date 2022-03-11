import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { FindFirstStatusOnAccountArgs } from "./args/FindFirstStatusOnAccountArgs";
import { StatusOnAccount } from "../../../models/StatusOnAccount";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => StatusOnAccount)
export class FindFirstStatusOnAccountResolver {
  @TypeGraphQL.Query(_returns => StatusOnAccount, {
    nullable: true
  })
  async findFirstStatusOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindFirstStatusOnAccountArgs): Promise<StatusOnAccount | null> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).statusOnAccount.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
