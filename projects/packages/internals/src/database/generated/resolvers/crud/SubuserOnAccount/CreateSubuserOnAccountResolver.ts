import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { CreateSubuserOnAccountArgs } from "./args/CreateSubuserOnAccountArgs";
import { SubuserOnAccount } from "../../../models/SubuserOnAccount";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => SubuserOnAccount)
export class CreateSubuserOnAccountResolver {
  @TypeGraphQL.Mutation(_returns => SubuserOnAccount, {
    nullable: false
  })
  async createSubuserOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateSubuserOnAccountArgs): Promise<SubuserOnAccount> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).subuserOnAccount.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
