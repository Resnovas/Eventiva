import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AddressCreateNestedManyWithoutAccountInput } from "../inputs/AddressCreateNestedManyWithoutAccountInput";
import { AddressCreateNestedOneWithoutPrimaryAccountInput } from "../inputs/AddressCreateNestedOneWithoutPrimaryAccountInput";
import { ApplicationCreateNestedManyWithoutAccountInput } from "../inputs/ApplicationCreateNestedManyWithoutAccountInput";
import { ContactAtAddressCreateNestedManyWithoutAccountInput } from "../inputs/ContactAtAddressCreateNestedManyWithoutAccountInput";
import { EmailCreateNestedManyWithoutAccountInput } from "../inputs/EmailCreateNestedManyWithoutAccountInput";
import { EmployersOnAccountCreateNestedManyWithoutAccountInput } from "../inputs/EmployersOnAccountCreateNestedManyWithoutAccountInput";
import { EmployersOnAccountCreateNestedManyWithoutEmployerInput } from "../inputs/EmployersOnAccountCreateNestedManyWithoutEmployerInput";
import { FilesCreateNestedManyWithoutAccountInput } from "../inputs/FilesCreateNestedManyWithoutAccountInput";
import { ManagersOnAccountCreateNestedManyWithoutAccountInput } from "../inputs/ManagersOnAccountCreateNestedManyWithoutAccountInput";
import { ManagersOnAccountCreateNestedManyWithoutManagersInput } from "../inputs/ManagersOnAccountCreateNestedManyWithoutManagersInput";
import { PhoneCreateNestedManyWithoutAccountInput } from "../inputs/PhoneCreateNestedManyWithoutAccountInput";
import { RTWCreateNestedManyWithoutAccountInput } from "../inputs/RTWCreateNestedManyWithoutAccountInput";
import { SIABadgeCreateNestedManyWithoutAccountInput } from "../inputs/SIABadgeCreateNestedManyWithoutAccountInput";
import { SaltCreateNestedOneWithoutAccountInput } from "../inputs/SaltCreateNestedOneWithoutAccountInput";
import { StatusOnAccountCreateNestedManyWithoutAccountInput } from "../inputs/StatusOnAccountCreateNestedManyWithoutAccountInput";
import { SubscriptionOnAccountCreateNestedManyWithoutAccountInput } from "../inputs/SubscriptionOnAccountCreateNestedManyWithoutAccountInput";
import { SubuserOnAccountCreateNestedManyWithoutAccountInput } from "../inputs/SubuserOnAccountCreateNestedManyWithoutAccountInput";
import { SubuserOnAccountCreateNestedManyWithoutSubuserInput } from "../inputs/SubuserOnAccountCreateNestedManyWithoutSubuserInput";
import { TransactionCreateNestedManyWithoutAccountInput } from "../inputs/TransactionCreateNestedManyWithoutAccountInput";
import { AccountType } from "../../enums/AccountType";
import { Title } from "../../enums/Title";

@TypeGraphQL.InputType("AccountCreateWithoutApiTokenInput", {
  isAbstract: true
})
export class AccountCreateWithoutApiTokenInput {
  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  id?: string | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  prn?: number | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  username?: string | undefined;

  @TypeGraphQL.Field(_type => AccountType, {
    nullable: true
  })
  accountType?: "USER" | "BUSINESS" | "PROVIDER" | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  subsciption?: boolean | undefined;

  @TypeGraphQL.Field(_type => EmployersOnAccountCreateNestedManyWithoutAccountInput, {
    nullable: true
  })
  employer?: EmployersOnAccountCreateNestedManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => EmployersOnAccountCreateNestedManyWithoutEmployerInput, {
    nullable: true
  })
  employees?: EmployersOnAccountCreateNestedManyWithoutEmployerInput | undefined;

  @TypeGraphQL.Field(_type => SubuserOnAccountCreateNestedManyWithoutAccountInput, {
    nullable: true
  })
  accesses?: SubuserOnAccountCreateNestedManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => SubuserOnAccountCreateNestedManyWithoutSubuserInput, {
    nullable: true
  })
  subusers?: SubuserOnAccountCreateNestedManyWithoutSubuserInput | undefined;

  @TypeGraphQL.Field(_type => ManagersOnAccountCreateNestedManyWithoutAccountInput, {
    nullable: true
  })
  accounts?: ManagersOnAccountCreateNestedManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => ManagersOnAccountCreateNestedManyWithoutManagersInput, {
    nullable: true
  })
  managers?: ManagersOnAccountCreateNestedManyWithoutManagersInput | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  updatedAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  lastLogin?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  applied?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  promoted?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  retired?: Date | undefined;

  @TypeGraphQL.Field(_type => Title, {
    nullable: true
  })
  title?: "Miss" | "Ms" | "Mrs" | "Mr" | "Dr" | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  firstname?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  midname?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  lastname?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  Salutation?: string | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  dob?: Date | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  sex?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  label!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  password?: string | undefined;

  @TypeGraphQL.Field(_type => SaltCreateNestedOneWithoutAccountInput, {
    nullable: true
  })
  Salt?: SaltCreateNestedOneWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  resetPasswordToken?: string | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  resetPasswordExpires?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deletedDate?: Date | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  deleted?: boolean | undefined;

  @TypeGraphQL.Field(_type => AddressCreateNestedOneWithoutPrimaryAccountInput, {
    nullable: true
  })
  primaryAddress?: AddressCreateNestedOneWithoutPrimaryAccountInput | undefined;

  @TypeGraphQL.Field(_type => AddressCreateNestedManyWithoutAccountInput, {
    nullable: true
  })
  addresses?: AddressCreateNestedManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => ContactAtAddressCreateNestedManyWithoutAccountInput, {
    nullable: true
  })
  contactOfAddress?: ContactAtAddressCreateNestedManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => ApplicationCreateNestedManyWithoutAccountInput, {
    nullable: true
  })
  application?: ApplicationCreateNestedManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => EmailCreateNestedManyWithoutAccountInput, {
    nullable: true
  })
  emails?: EmailCreateNestedManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => FilesCreateNestedManyWithoutAccountInput, {
    nullable: true
  })
  files?: FilesCreateNestedManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => PhoneCreateNestedManyWithoutAccountInput, {
    nullable: true
  })
  phones?: PhoneCreateNestedManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => RTWCreateNestedManyWithoutAccountInput, {
    nullable: true
  })
  rtw?: RTWCreateNestedManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => SIABadgeCreateNestedManyWithoutAccountInput, {
    nullable: true
  })
  sia?: SIABadgeCreateNestedManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => StatusOnAccountCreateNestedManyWithoutAccountInput, {
    nullable: true
  })
  Status?: StatusOnAccountCreateNestedManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => SubscriptionOnAccountCreateNestedManyWithoutAccountInput, {
    nullable: true
  })
  subscription?: SubscriptionOnAccountCreateNestedManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => TransactionCreateNestedManyWithoutAccountInput, {
    nullable: true
  })
  transactions?: TransactionCreateNestedManyWithoutAccountInput | undefined;
}
