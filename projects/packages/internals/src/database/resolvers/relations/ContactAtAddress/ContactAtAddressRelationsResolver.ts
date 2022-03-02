import * as TypeGraphQL from 'type-graphql';
import { Account } from '../../../models/Account';
import { Address } from '../../../models/Address';
import { ContactAtAddress } from '../../../models/ContactAtAddress';
import { Email } from '../../../models/Email';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => ContactAtAddress)
export class ContactAtAddressRelationsResolver {
  @TypeGraphQL.FieldResolver((_type) => Account, {
    nullable: false,
  })
  async account(
    @TypeGraphQL.Root() contactAtAddress: ContactAtAddress,
    @TypeGraphQL.Ctx() ctx: any
  ): Promise<Account> {
    return getPrismaFromContext(ctx)
      .contactAtAddress.findUnique({
        where: {
          accountId_addressId: {
            accountId: contactAtAddress.accountId,
            addressId: contactAtAddress.addressId,
          },
        },
      })
      .account({});
  }

  @TypeGraphQL.FieldResolver((_type) => Address, {
    nullable: false,
  })
  async address(
    @TypeGraphQL.Root() contactAtAddress: ContactAtAddress,
    @TypeGraphQL.Ctx() ctx: any
  ): Promise<Address> {
    return getPrismaFromContext(ctx)
      .contactAtAddress.findUnique({
        where: {
          accountId_addressId: {
            accountId: contactAtAddress.accountId,
            addressId: contactAtAddress.addressId,
          },
        },
      })
      .address({});
  }

  @TypeGraphQL.FieldResolver((_type) => Email, {
    nullable: true,
  })
  async email(
    @TypeGraphQL.Root() contactAtAddress: ContactAtAddress,
    @TypeGraphQL.Ctx() ctx: any
  ): Promise<Email | null> {
    return getPrismaFromContext(ctx)
      .contactAtAddress.findUnique({
        where: {
          accountId_addressId: {
            accountId: contactAtAddress.accountId,
            addressId: contactAtAddress.addressId,
          },
        },
      })
      .email({});
  }
}
