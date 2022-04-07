import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../scalars";
import { Account } from "../models/Account";
import { Address } from "../models/Address";

@TypeGraphQL.ObjectType("Phone", {
  isAbstract: true
})
export class Phone {
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

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deletedDate?: Date | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  deleted?: boolean | null;

  account?: Account;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  accountId!: string;

  address?: Address;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  addressId!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  phone!: string;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: false
  })
  public!: boolean;
}
