import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountRelationFilter } from "../inputs/AccountRelationFilter";
import { BoolFilter } from "../inputs/BoolFilter";
import { BoolNullableFilter } from "../inputs/BoolNullableFilter";
import { ContactAtAddressListRelationFilter } from "../inputs/ContactAtAddressListRelationFilter";
import { DateTimeFilter } from "../inputs/DateTimeFilter";
import { DateTimeNullableFilter } from "../inputs/DateTimeNullableFilter";
import { EnumAddressTypeFilter } from "../inputs/EnumAddressTypeFilter";
import { FeatureOfAddressListRelationFilter } from "../inputs/FeatureOfAddressListRelationFilter";
import { JsonNullableFilter } from "../inputs/JsonNullableFilter";
import { PhoneListRelationFilter } from "../inputs/PhoneListRelationFilter";
import { RoomListRelationFilter } from "../inputs/RoomListRelationFilter";
import { StringFilter } from "../inputs/StringFilter";
import { StringNullableFilter } from "../inputs/StringNullableFilter";
import { VenueStyleListRelationFilter } from "../inputs/VenueStyleListRelationFilter";

@TypeGraphQL.InputType("AddressWhereInput", {
  isAbstract: true
})
export class AddressWhereInput {
  @TypeGraphQL.Field(_type => [AddressWhereInput], {
    nullable: true
  })
  AND?: AddressWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [AddressWhereInput], {
    nullable: true
  })
  OR?: AddressWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [AddressWhereInput], {
    nullable: true
  })
  NOT?: AddressWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  id?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeFilter, {
    nullable: true
  })
  createdAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeFilter, {
    nullable: true
  })
  updatedAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field(_type => AccountRelationFilter, {
    nullable: true
  })
  account?: AccountRelationFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  accountId?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => EnumAddressTypeFilter, {
    nullable: true
  })
  type?: EnumAddressTypeFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  coords?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  street?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  city?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  state?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  country?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  zipcode?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  addressName?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  name?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => BoolNullableFilter, {
    nullable: true
  })
  parking?: BoolNullableFilter | undefined;

  @TypeGraphQL.Field(_type => ContactAtAddressListRelationFilter, {
    nullable: true
  })
  contacts?: ContactAtAddressListRelationFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  website?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => JsonNullableFilter, {
    nullable: true
  })
  hoursOfOperation?: JsonNullableFilter | undefined;

  @TypeGraphQL.Field(_type => VenueStyleListRelationFilter, {
    nullable: true
  })
  venueStyle?: VenueStyleListRelationFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  features?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => JsonNullableFilter, {
    nullable: true
  })
  details?: JsonNullableFilter | undefined;

  @TypeGraphQL.Field(_type => BoolFilter, {
    nullable: true
  })
  public?: BoolFilter | undefined;

  @TypeGraphQL.Field(_type => AccountRelationFilter, {
    nullable: true
  })
  primaryAccount?: AccountRelationFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  primaryaccountId?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeNullableFilter, {
    nullable: true
  })
  deletedDate?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field(_type => BoolNullableFilter, {
    nullable: true
  })
  deleted?: BoolNullableFilter | undefined;

  @TypeGraphQL.Field(_type => FeatureOfAddressListRelationFilter, {
    nullable: true
  })
  featuresOfBuisness?: FeatureOfAddressListRelationFilter | undefined;

  @TypeGraphQL.Field(_type => PhoneListRelationFilter, {
    nullable: true
  })
  phones?: PhoneListRelationFilter | undefined;

  @TypeGraphQL.Field(_type => RoomListRelationFilter, {
    nullable: true
  })
  rooms?: RoomListRelationFilter | undefined;
}
