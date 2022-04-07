import * as TypeGraphQL from "type-graphql";
import { Account } from "../../../models/Account";
import { SIACheck } from "../../../models/SIACheck";
import { Transaction } from "../../../models/Transaction";
import { TransactionSIACheckArgs } from "./args/TransactionSIACheckArgs";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Transaction)
export class TransactionRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => Account, {
    nullable: false
  })
  async account(@TypeGraphQL.Root() transaction: Transaction, @TypeGraphQL.Ctx() ctx: any): Promise<Account> {
    return getPrismaFromContext(ctx).transaction.findUnique({
      where: {
        id: transaction.id,
      },
    }).account({});
  }

  @TypeGraphQL.FieldResolver(_type => [SIACheck], {
    nullable: false
  })
  async SIACheck(@TypeGraphQL.Root() transaction: Transaction, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: TransactionSIACheckArgs): Promise<SIACheck[]> {
    return getPrismaFromContext(ctx).transaction.findUnique({
      where: {
        id: transaction.id,
      },
    }).SIACheck(args);
  }
}
