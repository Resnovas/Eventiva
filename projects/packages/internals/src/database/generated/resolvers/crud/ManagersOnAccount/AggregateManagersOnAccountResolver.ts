import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { AggregateManagersOnAccountArgs } from "./args/AggregateManagersOnAccountArgs";
import { ManagersOnAccount } from "../../../models/ManagersOnAccount";
import { AggregateManagersOnAccount } from "../../outputs/AggregateManagersOnAccount";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => ManagersOnAccount)
export class AggregateManagersOnAccountResolver {
  @TypeGraphQL.Query(_returns => AggregateManagersOnAccount, {
    nullable: false
  })
  async aggregateManagersOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateManagersOnAccountArgs): Promise<AggregateManagersOnAccount> {
    return getPrismaFromContext(ctx).managersOnAccount.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
