import * as TypeGraphQL from "type-graphql";
import { Account } from "../../../models/Account";
import { ManagersOnAccount } from "../../../models/ManagersOnAccount";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => ManagersOnAccount)
export class ManagersOnAccountRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => Account, {
    nullable: false
  })
  async account(@TypeGraphQL.Root() managersOnAccount: ManagersOnAccount, @TypeGraphQL.Ctx() ctx: any): Promise<Account> {
    return getPrismaFromContext(ctx).managersOnAccount.findUnique({
      where: {
        accountId_managersId: {
          accountId: managersOnAccount.accountId,
          managersId: managersOnAccount.managersId,
        },
      },
    }).account({});
  }

  @TypeGraphQL.FieldResolver(_type => Account, {
    nullable: false
  })
  async managers(@TypeGraphQL.Root() managersOnAccount: ManagersOnAccount, @TypeGraphQL.Ctx() ctx: any): Promise<Account> {
    return getPrismaFromContext(ctx).managersOnAccount.findUnique({
      where: {
        accountId_managersId: {
          accountId: managersOnAccount.accountId,
          managersId: managersOnAccount.managersId,
        },
      },
    }).managers({});
  }
}
