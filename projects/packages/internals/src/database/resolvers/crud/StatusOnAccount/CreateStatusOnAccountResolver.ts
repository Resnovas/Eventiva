import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { CreateStatusOnAccountArgs } from "./args/CreateStatusOnAccountArgs";
import { StatusOnAccount } from "../../../models/StatusOnAccount";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => StatusOnAccount)
export class CreateStatusOnAccountResolver {
  @TypeGraphQL.Mutation(_returns => StatusOnAccount, {
    nullable: false
  })
  async createStatusOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateStatusOnAccountArgs): Promise<StatusOnAccount> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).statusOnAccount.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
