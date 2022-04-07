import * as TypeGraphQL from "type-graphql";
import { Account } from "../../../models/Account";
import { Address } from "../../../models/Address";
import { ContactAtAddress } from "../../../models/ContactAtAddress";
import { FeatureOfAddress } from "../../../models/FeatureOfAddress";
import { Phone } from "../../../models/Phone";
import { Room } from "../../../models/Room";
import { VenueStyle } from "../../../models/VenueStyle";
import { AddressContactsArgs } from "./args/AddressContactsArgs";
import { AddressFeaturesOfBuisnessArgs } from "./args/AddressFeaturesOfBuisnessArgs";
import { AddressPhonesArgs } from "./args/AddressPhonesArgs";
import { AddressRoomsArgs } from "./args/AddressRoomsArgs";
import { AddressVenueStyleArgs } from "./args/AddressVenueStyleArgs";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Address)
export class AddressRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => Account, {
    nullable: false
  })
  async account(@TypeGraphQL.Root() address: Address, @TypeGraphQL.Ctx() ctx: any): Promise<Account> {
    return getPrismaFromContext(ctx).address.findUnique({
      where: {
        id: address.id,
      },
    }).account({});
  }

  @TypeGraphQL.FieldResolver(_type => [ContactAtAddress], {
    nullable: false
  })
  async contacts(@TypeGraphQL.Root() address: Address, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: AddressContactsArgs): Promise<ContactAtAddress[]> {
    return getPrismaFromContext(ctx).address.findUnique({
      where: {
        id: address.id,
      },
    }).contacts(args);
  }

  @TypeGraphQL.FieldResolver(_type => [VenueStyle], {
    nullable: false
  })
  async venueStyle(@TypeGraphQL.Root() address: Address, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: AddressVenueStyleArgs): Promise<VenueStyle[]> {
    return getPrismaFromContext(ctx).address.findUnique({
      where: {
        id: address.id,
      },
    }).venueStyle(args);
  }

  @TypeGraphQL.FieldResolver(_type => Account, {
    nullable: true
  })
  async primaryAccount(@TypeGraphQL.Root() address: Address, @TypeGraphQL.Ctx() ctx: any): Promise<Account | null> {
    return getPrismaFromContext(ctx).address.findUnique({
      where: {
        id: address.id,
      },
    }).primaryAccount({});
  }

  @TypeGraphQL.FieldResolver(_type => [FeatureOfAddress], {
    nullable: false
  })
  async featuresOfBuisness(@TypeGraphQL.Root() address: Address, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: AddressFeaturesOfBuisnessArgs): Promise<FeatureOfAddress[]> {
    return getPrismaFromContext(ctx).address.findUnique({
      where: {
        id: address.id,
      },
    }).featuresOfBuisness(args);
  }

  @TypeGraphQL.FieldResolver(_type => [Phone], {
    nullable: false
  })
  async phones(@TypeGraphQL.Root() address: Address, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: AddressPhonesArgs): Promise<Phone[]> {
    return getPrismaFromContext(ctx).address.findUnique({
      where: {
        id: address.id,
      },
    }).phones(args);
  }

  @TypeGraphQL.FieldResolver(_type => [Room], {
    nullable: false
  })
  async rooms(@TypeGraphQL.Root() address: Address, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: AddressRoomsArgs): Promise<Room[]> {
    return getPrismaFromContext(ctx).address.findUnique({
      where: {
        id: address.id,
      },
    }).rooms(args);
  }
}
