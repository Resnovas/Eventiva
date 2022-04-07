import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../scalars";
import { Account } from "../models/Account";
import { Address } from "../models/Address";
import { Email } from "../models/Email";

@TypeGraphQL.ObjectType("ContactAtAddress", {
  isAbstract: true
})
export class ContactAtAddress {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  accountId!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  addressId!: string;

  account?: Account;

  address?: Address;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  jobTitle?: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  phone?: string | null;

  email?: Email | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  emailId?: string | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  createdAt!: Date;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  updatedAt!: Date;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deletedDate?: Date | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  deleted?: boolean | null;
}
