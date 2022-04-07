import * as TypeGraphQL from "type-graphql";
import { Account } from "../../../models/Account";
import { EmployersOnAccount } from "../../../models/EmployersOnAccount";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => EmployersOnAccount)
export class EmployersOnAccountRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => Account, {
    nullable: false
  })
  async account(@TypeGraphQL.Root() employersOnAccount: EmployersOnAccount, @TypeGraphQL.Ctx() ctx: any): Promise<Account> {
    return getPrismaFromContext(ctx).employersOnAccount.findUnique({
      where: {
        accountId_employerId: {
          accountId: employersOnAccount.accountId,
          employerId: employersOnAccount.employerId,
        },
      },
    }).account({});
  }

  @TypeGraphQL.FieldResolver(_type => Account, {
    nullable: false
  })
  async employer(@TypeGraphQL.Root() employersOnAccount: EmployersOnAccount, @TypeGraphQL.Ctx() ctx: any): Promise<Account> {
    return getPrismaFromContext(ctx).employersOnAccount.findUnique({
      where: {
        accountId_employerId: {
          accountId: employersOnAccount.accountId,
          employerId: employersOnAccount.employerId,
        },
      },
    }).employer({});
  }
}
