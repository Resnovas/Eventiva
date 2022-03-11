import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../scalars";
import { Address } from "../models/Address";
import { Application } from "../models/Application";
import { ContactAtAddress } from "../models/ContactAtAddress";
import { Email } from "../models/Email";
import { EmployersOnAccount } from "../models/EmployersOnAccount";
import { Files } from "../models/Files";
import { ManagersOnAccount } from "../models/ManagersOnAccount";
import { Phone } from "../models/Phone";
import { RTW } from "../models/RTW";
import { SIABadge } from "../models/SIABadge";
import { StatusOnAccount } from "../models/StatusOnAccount";
import { SubscriptionOnAccount } from "../models/SubscriptionOnAccount";
import { SubuserOnAccount } from "../models/SubuserOnAccount";
import { Token } from "../models/Token";
import { Transaction } from "../models/Transaction";
import { AccountType } from "../enums/AccountType";
import { Title } from "../enums/Title";
import { AccountCount } from "../resolvers/outputs/AccountCount";

@TypeGraphQL.ObjectType("Account", {
  isAbstract: true
})
export class Account {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  id!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  username?: string | null;

  @TypeGraphQL.Field(_type => AccountType, {
    nullable: false
  })
  accountType!: "USER" | "BUSINESS" | "PROVIDER";

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: false
  })
  subsciption!: boolean;

  employer?: EmployersOnAccount[];

  employees?: EmployersOnAccount[];

  accesses?: SubuserOnAccount[];

  subusers?: SubuserOnAccount[];

  accounts?: ManagersOnAccount[];

  managers?: ManagersOnAccount[];

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
  lastLogin?: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  applied?: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  promoted?: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  retired?: Date | null;

  @TypeGraphQL.Field(_type => Title, {
    nullable: true
  })
  title?: "Miss" | "Ms" | "Mrs" | "Mr" | "Dr" | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  firstname?: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  midname?: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  lastname?: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  Salutation?: string | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  dob?: Date | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  sex?: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  label!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  password?: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  resetPasswordToken?: string | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  resetPasswordExpires?: Date | null;

  apiToken?: Token[];

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deleted?: Date | null;

  primaryAddress?: Address | null;

  addresses?: Address[];

  contactOfAddress?: ContactAtAddress[];

  application?: Application[];

  emails?: Email[];

  files?: Files[];

  phones?: Phone[];

  rtw?: RTW[];

  sia?: SIABadge[];

  Status?: StatusOnAccount[];

  subscription?: SubscriptionOnAccount[];

  transactions?: Transaction[];

  @TypeGraphQL.Field(_type => AccountCount, {
    nullable: true
  })
  _count?: AccountCount | null;
}
