import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { DeleteSubuserOnAccountArgs } from "./args/DeleteSubuserOnAccountArgs";
import { SubuserOnAccount } from "../../../models/SubuserOnAccount";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => SubuserOnAccount)
export class DeleteSubuserOnAccountResolver {
  @TypeGraphQL.Mutation(_returns => SubuserOnAccount, {
    nullable: true
  })
  async deleteSubuserOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: DeleteSubuserOnAccountArgs): Promise<SubuserOnAccount | null> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).subuserOnAccount.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
