import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../scalars";
import { Account } from "../models/Account";
import { ContactAtAddress } from "../models/ContactAtAddress";
import { FeatureOfAddress } from "../models/FeatureOfAddress";
import { Phone } from "../models/Phone";
import { Room } from "../models/Room";
import { VenueStyle } from "../models/VenueStyle";
import { AddressType } from "../enums/AddressType";
import { AddressCount } from "../resolvers/outputs/AddressCount";

@TypeGraphQL.ObjectType("Address", {
  isAbstract: true
})
export class Address {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  id!: string;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  createdAt!: Date;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  updatedAt!: Date;

  account?: Account;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  accountId!: string;

  @TypeGraphQL.Field(_type => AddressType, {
    nullable: false
  })
  type!: "PERSONAL" | "BUSINESS";

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  coords?: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  street!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  city?: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  state?: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  country?: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  zipcode?: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  addressName?: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  name?: string | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  parking?: boolean | null;

  contacts?: ContactAtAddress[];

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  website?: string | null;

  @TypeGraphQL.Field(_type => GraphQLScalars.JSONResolver, {
    nullable: true
  })
  hoursOfOperation?: Prisma.JsonValue | null;

  venueStyle?: VenueStyle[];

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  features!: string;

  @TypeGraphQL.Field(_type => GraphQLScalars.JSONResolver, {
    nullable: true
  })
  details?: Prisma.JsonValue | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: false
  })
  public!: boolean;

  primaryAccount?: Account | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  primaryaccountId?: string | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deleted?: Date | null;

  featuresOfBuisness?: FeatureOfAddress[];

  phones?: Phone[];

  rooms?: Room[];

  @TypeGraphQL.Field(_type => AddressCount, {
    nullable: true
  })
  _count?: AddressCount | null;
}
