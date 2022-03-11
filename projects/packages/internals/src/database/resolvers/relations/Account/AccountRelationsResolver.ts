import * as TypeGraphQL from "type-graphql";
import { Account } from "../../../models/Account";
import { Address } from "../../../models/Address";
import { Application } from "../../../models/Application";
import { ContactAtAddress } from "../../../models/ContactAtAddress";
import { Email } from "../../../models/Email";
import { EmployersOnAccount } from "../../../models/EmployersOnAccount";
import { Files } from "../../../models/Files";
import { ManagersOnAccount } from "../../../models/ManagersOnAccount";
import { Phone } from "../../../models/Phone";
import { RTW } from "../../../models/RTW";
import { SIABadge } from "../../../models/SIABadge";
import { StatusOnAccount } from "../../../models/StatusOnAccount";
import { SubscriptionOnAccount } from "../../../models/SubscriptionOnAccount";
import { SubuserOnAccount } from "../../../models/SubuserOnAccount";
import { Token } from "../../../models/Token";
import { Transaction } from "../../../models/Transaction";
import { AccountAccessesArgs } from "./args/AccountAccessesArgs";
import { AccountAccountsArgs } from "./args/AccountAccountsArgs";
import { AccountAddressesArgs } from "./args/AccountAddressesArgs";
import { AccountApiTokenArgs } from "./args/AccountApiTokenArgs";
import { AccountApplicationArgs } from "./args/AccountApplicationArgs";
import { AccountContactOfAddressArgs } from "./args/AccountContactOfAddressArgs";
import { AccountEmailsArgs } from "./args/AccountEmailsArgs";
import { AccountEmployeesArgs } from "./args/AccountEmployeesArgs";
import { AccountEmployerArgs } from "./args/AccountEmployerArgs";
import { AccountFilesArgs } from "./args/AccountFilesArgs";
import { AccountManagersArgs } from "./args/AccountManagersArgs";
import { AccountPhonesArgs } from "./args/AccountPhonesArgs";
import { AccountRtwArgs } from "./args/AccountRtwArgs";
import { AccountSiaArgs } from "./args/AccountSiaArgs";
import { AccountStatusArgs } from "./args/AccountStatusArgs";
import { AccountSubscriptionArgs } from "./args/AccountSubscriptionArgs";
import { AccountSubusersArgs } from "./args/AccountSubusersArgs";
import { AccountTransactionsArgs } from "./args/AccountTransactionsArgs";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Account)
export class AccountRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => [EmployersOnAccount], {
    nullable: false
  })
  async employer(@TypeGraphQL.Root() account: Account, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: AccountEmployerArgs): Promise<EmployersOnAccount[]> {
    return getPrismaFromContext(ctx).account.findUnique({
      where: {
        id: account.id,
      },
    }).employer(args);
  }

  @TypeGraphQL.FieldResolver(_type => [EmployersOnAccount], {
    nullable: false
  })
  async employees(@TypeGraphQL.Root() account: Account, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: AccountEmployeesArgs): Promise<EmployersOnAccount[]> {
    return getPrismaFromContext(ctx).account.findUnique({
      where: {
        id: account.id,
      },
    }).employees(args);
  }

  @TypeGraphQL.FieldResolver(_type => [SubuserOnAccount], {
    nullable: false
  })
  async accesses(@TypeGraphQL.Root() account: Account, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: AccountAccessesArgs): Promise<SubuserOnAccount[]> {
    return getPrismaFromContext(ctx).account.findUnique({
      where: {
        id: account.id,
      },
    }).accesses(args);
  }

  @TypeGraphQL.FieldResolver(_type => [SubuserOnAccount], {
    nullable: false
  })
  async subusers(@TypeGraphQL.Root() account: Account, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: AccountSubusersArgs): Promise<SubuserOnAccount[]> {
    return getPrismaFromContext(ctx).account.findUnique({
      where: {
        id: account.id,
      },
    }).subusers(args);
  }

  @TypeGraphQL.FieldResolver(_type => [ManagersOnAccount], {
    nullable: false
  })
  async accounts(@TypeGraphQL.Root() account: Account, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: AccountAccountsArgs): Promise<ManagersOnAccount[]> {
    return getPrismaFromContext(ctx).account.findUnique({
      where: {
        id: account.id,
      },
    }).accounts(args);
  }

  @TypeGraphQL.FieldResolver(_type => [ManagersOnAccount], {
    nullable: false
  })
  async managers(@TypeGraphQL.Root() account: Account, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: AccountManagersArgs): Promise<ManagersOnAccount[]> {
    return getPrismaFromContext(ctx).account.findUnique({
      where: {
        id: account.id,
      },
    }).managers(args);
  }

  @TypeGraphQL.FieldResolver(_type => [Token], {
    nullable: false
  })
  async apiToken(@TypeGraphQL.Root() account: Account, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: AccountApiTokenArgs): Promise<Token[]> {
    return getPrismaFromContext(ctx).account.findUnique({
      where: {
        id: account.id,
      },
    }).apiToken(args);
  }

  @TypeGraphQL.FieldResolver(_type => Address, {
    nullable: true
  })
  async primaryAddress(@TypeGraphQL.Root() account: Account, @TypeGraphQL.Ctx() ctx: any): Promise<Address | null> {
    return getPrismaFromContext(ctx).account.findUnique({
      where: {
        id: account.id,
      },
    }).primaryAddress({});
  }

  @TypeGraphQL.FieldResolver(_type => [Address], {
    nullable: false
  })
  async addresses(@TypeGraphQL.Root() account: Account, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: AccountAddressesArgs): Promise<Address[]> {
    return getPrismaFromContext(ctx).account.findUnique({
      where: {
        id: account.id,
      },
    }).addresses(args);
  }

  @TypeGraphQL.FieldResolver(_type => [ContactAtAddress], {
    nullable: false
  })
  async contactOfAddress(@TypeGraphQL.Root() account: Account, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: AccountContactOfAddressArgs): Promise<ContactAtAddress[]> {
    return getPrismaFromContext(ctx).account.findUnique({
      where: {
        id: account.id,
      },
    }).contactOfAddress(args);
  }

  @TypeGraphQL.FieldResolver(_type => [Application], {
    nullable: false
  })
  async application(@TypeGraphQL.Root() account: Account, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: AccountApplicationArgs): Promise<Application[]> {
    return getPrismaFromContext(ctx).account.findUnique({
      where: {
        id: account.id,
      },
    }).application(args);
  }

  @TypeGraphQL.FieldResolver(_type => [Email], {
    nullable: false
  })
  async emails(@TypeGraphQL.Root() account: Account, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: AccountEmailsArgs): Promise<Email[]> {
    return getPrismaFromContext(ctx).account.findUnique({
      where: {
        id: account.id,
      },
    }).emails(args);
  }

  @TypeGraphQL.FieldResolver(_type => [Files], {
    nullable: false
  })
  async files(@TypeGraphQL.Root() account: Account, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: AccountFilesArgs): Promise<Files[]> {
    return getPrismaFromContext(ctx).account.findUnique({
      where: {
        id: account.id,
      },
    }).files(args);
  }

  @TypeGraphQL.FieldResolver(_type => [Phone], {
    nullable: false
  })
  async phones(@TypeGraphQL.Root() account: Account, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: AccountPhonesArgs): Promise<Phone[]> {
    return getPrismaFromContext(ctx).account.findUnique({
      where: {
        id: account.id,
      },
    }).phones(args);
  }

  @TypeGraphQL.FieldResolver(_type => [RTW], {
    nullable: false
  })
  async rtw(@TypeGraphQL.Root() account: Account, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: AccountRtwArgs): Promise<RTW[]> {
    return getPrismaFromContext(ctx).account.findUnique({
      where: {
        id: account.id,
      },
    }).rtw(args);
  }

  @TypeGraphQL.FieldResolver(_type => [SIABadge], {
    nullable: false
  })
  async sia(@TypeGraphQL.Root() account: Account, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: AccountSiaArgs): Promise<SIABadge[]> {
    return getPrismaFromContext(ctx).account.findUnique({
      where: {
        id: account.id,
      },
    }).sia(args);
  }

  @TypeGraphQL.FieldResolver(_type => [StatusOnAccount], {
    nullable: false
  })
  async Status(@TypeGraphQL.Root() account: Account, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: AccountStatusArgs): Promise<StatusOnAccount[]> {
    return getPrismaFromContext(ctx).account.findUnique({
      where: {
        id: account.id,
      },
    }).Status(args);
  }

  @TypeGraphQL.FieldResolver(_type => [SubscriptionOnAccount], {
    nullable: false
  })
  async subscription(@TypeGraphQL.Root() account: Account, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: AccountSubscriptionArgs): Promise<SubscriptionOnAccount[]> {
    return getPrismaFromContext(ctx).account.findUnique({
      where: {
        id: account.id,
      },
    }).subscription(args);
  }

  @TypeGraphQL.FieldResolver(_type => [Transaction], {
    nullable: false
  })
  async transactions(@TypeGraphQL.Root() account: Account, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: AccountTransactionsArgs): Promise<Transaction[]> {
    return getPrismaFromContext(ctx).account.findUnique({
      where: {
        id: account.id,
      },
    }).transactions(args);
  }
}
