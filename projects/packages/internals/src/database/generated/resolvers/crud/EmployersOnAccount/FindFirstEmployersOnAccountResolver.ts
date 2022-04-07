import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { FindFirstEmployersOnAccountArgs } from "./args/FindFirstEmployersOnAccountArgs";
import { EmployersOnAccount } from "../../../models/EmployersOnAccount";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => EmployersOnAccount)
export class FindFirstEmployersOnAccountResolver {
  @TypeGraphQL.Query(_returns => EmployersOnAccount, {
    nullable: true
  })
  async findFirstEmployersOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindFirstEmployersOnAccountArgs): Promise<EmployersOnAccount | null> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).employersOnAccount.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
