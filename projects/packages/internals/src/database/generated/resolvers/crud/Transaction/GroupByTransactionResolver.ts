import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { GroupByTransactionArgs } from "./args/GroupByTransactionArgs";
import { Transaction } from "../../../models/Transaction";
import { TransactionGroupBy } from "../../outputs/TransactionGroupBy";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Transaction)
export class GroupByTransactionResolver {
  @TypeGraphQL.Query(_returns => [TransactionGroupBy], {
    nullable: false
  })
  async groupByTransaction(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: GroupByTransactionArgs): Promise<TransactionGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).transaction.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(([_, v]) => v != null)
      ),
    });
  }
}
