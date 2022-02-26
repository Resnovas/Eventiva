import * as TypeGraphQL from 'type-graphql';
import { Account } from '../../../models/Account';
import { SubuserOnAccount } from '../../../models/SubuserOnAccount';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => SubuserOnAccount)
export class SubuserOnAccountRelationsResolver {
  @TypeGraphQL.FieldResolver((_type) => Account, {
    nullable: false,
  })
  async account(
    @TypeGraphQL.Root() subuserOnAccount: SubuserOnAccount,
    @TypeGraphQL.Ctx() ctx: any
  ): Promise<Account> {
    return getPrismaFromContext(ctx)
      .subuserOnAccount.findUnique({
        where: {
          accountId_subuserId: {
            accountId: subuserOnAccount.accountId,
            subuserId: subuserOnAccount.subuserId,
          },
        },
      })
      .account({});
  }

  @TypeGraphQL.FieldResolver((_type) => Account, {
    nullable: false,
  })
  async subuser(
    @TypeGraphQL.Root() subuserOnAccount: SubuserOnAccount,
    @TypeGraphQL.Ctx() ctx: any
  ): Promise<Account> {
    return getPrismaFromContext(ctx)
      .subuserOnAccount.findUnique({
        where: {
          accountId_subuserId: {
            accountId: subuserOnAccount.accountId,
            subuserId: subuserOnAccount.subuserId,
          },
        },
      })
      .subuser({});
  }
}
