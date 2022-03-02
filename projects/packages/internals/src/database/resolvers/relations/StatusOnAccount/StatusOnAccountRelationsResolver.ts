import * as TypeGraphQL from 'type-graphql';
import { Account } from '../../../models/Account';
import { Status } from '../../../models/Status';
import { StatusOnAccount } from '../../../models/StatusOnAccount';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => StatusOnAccount)
export class StatusOnAccountRelationsResolver {
  @TypeGraphQL.FieldResolver((_type) => Status, {
    nullable: false,
  })
  async status(
    @TypeGraphQL.Root() statusOnAccount: StatusOnAccount,
    @TypeGraphQL.Ctx() ctx: any
  ): Promise<Status> {
    return getPrismaFromContext(ctx)
      .statusOnAccount.findUnique({
        where: {
          statusId_accountId: {
            statusId: statusOnAccount.statusId,
            accountId: statusOnAccount.accountId,
          },
        },
      })
      .status({});
  }

  @TypeGraphQL.FieldResolver((_type) => Account, {
    nullable: false,
  })
  async account(
    @TypeGraphQL.Root() statusOnAccount: StatusOnAccount,
    @TypeGraphQL.Ctx() ctx: any
  ): Promise<Account> {
    return getPrismaFromContext(ctx)
      .statusOnAccount.findUnique({
        where: {
          statusId_accountId: {
            statusId: statusOnAccount.statusId,
            accountId: statusOnAccount.accountId,
          },
        },
      })
      .account({});
  }
}
