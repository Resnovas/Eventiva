import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AddressListRelationFilter } from "../inputs/AddressListRelationFilter";
import { AddressRelationFilter } from "../inputs/AddressRelationFilter";
import { ApplicationListRelationFilter } from "../inputs/ApplicationListRelationFilter";
import { BoolFilter } from "../inputs/BoolFilter";
import { BoolNullableFilter } from "../inputs/BoolNullableFilter";
import { ContactAtAddressListRelationFilter } from "../inputs/ContactAtAddressListRelationFilter";
import { DateTimeFilter } from "../inputs/DateTimeFilter";
import { DateTimeNullableFilter } from "../inputs/DateTimeNullableFilter";
import { EmailListRelationFilter } from "../inputs/EmailListRelationFilter";
import { EmployersOnAccountListRelationFilter } from "../inputs/EmployersOnAccountListRelationFilter";
import { EnumAccountTypeFilter } from "../inputs/EnumAccountTypeFilter";
import { EnumTitleNullableFilter } from "../inputs/EnumTitleNullableFilter";
import { FilesListRelationFilter } from "../inputs/FilesListRelationFilter";
import { IntFilter } from "../inputs/IntFilter";
import { ManagersOnAccountListRelationFilter } from "../inputs/ManagersOnAccountListRelationFilter";
import { PhoneListRelationFilter } from "../inputs/PhoneListRelationFilter";
import { RTWListRelationFilter } from "../inputs/RTWListRelationFilter";
import { SIABadgeListRelationFilter } from "../inputs/SIABadgeListRelationFilter";
import { SaltRelationFilter } from "../inputs/SaltRelationFilter";
import { StatusOnAccountListRelationFilter } from "../inputs/StatusOnAccountListRelationFilter";
import { StringFilter } from "../inputs/StringFilter";
import { StringNullableFilter } from "../inputs/StringNullableFilter";
import { SubscriptionOnAccountListRelationFilter } from "../inputs/SubscriptionOnAccountListRelationFilter";
import { SubuserOnAccountListRelationFilter } from "../inputs/SubuserOnAccountListRelationFilter";
import { TokenListRelationFilter } from "../inputs/TokenListRelationFilter";
import { TransactionListRelationFilter } from "../inputs/TransactionListRelationFilter";

@TypeGraphQL.InputType("AccountWhereInput", {
  isAbstract: true
})
export class AccountWhereInput {
  @TypeGraphQL.Field(_type => [AccountWhereInput], {
    nullable: true
  })
  AND?: AccountWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [AccountWhereInput], {
    nullable: true
  })
  OR?: AccountWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [AccountWhereInput], {
    nullable: true
  })
  NOT?: AccountWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  id?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => IntFilter, {
    nullable: true
  })
  prn?: IntFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  username?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => EnumAccountTypeFilter, {
    nullable: true
  })
  accountType?: EnumAccountTypeFilter | undefined;

  @TypeGraphQL.Field(_type => BoolFilter, {
    nullable: true
  })
  subsciption?: BoolFilter | undefined;

  @TypeGraphQL.Field(_type => EmployersOnAccountListRelationFilter, {
    nullable: true
  })
  employer?: EmployersOnAccountListRelationFilter | undefined;

  @TypeGraphQL.Field(_type => EmployersOnAccountListRelationFilter, {
    nullable: true
  })
  employees?: EmployersOnAccountListRelationFilter | undefined;

  @TypeGraphQL.Field(_type => SubuserOnAccountListRelationFilter, {
    nullable: true
  })
  accesses?: SubuserOnAccountListRelationFilter | undefined;

  @TypeGraphQL.Field(_type => SubuserOnAccountListRelationFilter, {
    nullable: true
  })
  subusers?: SubuserOnAccountListRelationFilter | undefined;

  @TypeGraphQL.Field(_type => ManagersOnAccountListRelationFilter, {
    nullable: true
  })
  accounts?: ManagersOnAccountListRelationFilter | undefined;

  @TypeGraphQL.Field(_type => ManagersOnAccountListRelationFilter, {
    nullable: true
  })
  managers?: ManagersOnAccountListRelationFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeFilter, {
    nullable: true
  })
  createdAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeFilter, {
    nullable: true
  })
  updatedAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeNullableFilter, {
    nullable: true
  })
  lastLogin?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeNullableFilter, {
    nullable: true
  })
  applied?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeNullableFilter, {
    nullable: true
  })
  promoted?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeNullableFilter, {
    nullable: true
  })
  retired?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field(_type => EnumTitleNullableFilter, {
    nullable: true
  })
  title?: EnumTitleNullableFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  firstname?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  midname?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  lastname?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  Salutation?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeNullableFilter, {
    nullable: true
  })
  dob?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  sex?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  label?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  password?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => SaltRelationFilter, {
    nullable: true
  })
  Salt?: SaltRelationFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  resetPasswordToken?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeNullableFilter, {
    nullable: true
  })
  resetPasswordExpires?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field(_type => TokenListRelationFilter, {
    nullable: true
  })
  apiToken?: TokenListRelationFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeNullableFilter, {
    nullable: true
  })
  deletedDate?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field(_type => BoolNullableFilter, {
    nullable: true
  })
  deleted?: BoolNullableFilter | undefined;

  @TypeGraphQL.Field(_type => AddressRelationFilter, {
    nullable: true
  })
  primaryAddress?: AddressRelationFilter | undefined;

  @TypeGraphQL.Field(_type => AddressListRelationFilter, {
    nullable: true
  })
  addresses?: AddressListRelationFilter | undefined;

  @TypeGraphQL.Field(_type => ContactAtAddressListRelationFilter, {
    nullable: true
  })
  contactOfAddress?: ContactAtAddressListRelationFilter | undefined;

  @TypeGraphQL.Field(_type => ApplicationListRelationFilter, {
    nullable: true
  })
  application?: ApplicationListRelationFilter | undefined;

  @TypeGraphQL.Field(_type => EmailListRelationFilter, {
    nullable: true
  })
  emails?: EmailListRelationFilter | undefined;

  @TypeGraphQL.Field(_type => FilesListRelationFilter, {
    nullable: true
  })
  files?: FilesListRelationFilter | undefined;

  @TypeGraphQL.Field(_type => PhoneListRelationFilter, {
    nullable: true
  })
  phones?: PhoneListRelationFilter | undefined;

  @TypeGraphQL.Field(_type => RTWListRelationFilter, {
    nullable: true
  })
  rtw?: RTWListRelationFilter | undefined;

  @TypeGraphQL.Field(_type => SIABadgeListRelationFilter, {
    nullable: true
  })
  sia?: SIABadgeListRelationFilter | undefined;

  @TypeGraphQL.Field(_type => StatusOnAccountListRelationFilter, {
    nullable: true
  })
  Status?: StatusOnAccountListRelationFilter | undefined;

  @TypeGraphQL.Field(_type => SubscriptionOnAccountListRelationFilter, {
    nullable: true
  })
  subscription?: SubscriptionOnAccountListRelationFilter | undefined;

  @TypeGraphQL.Field(_type => TransactionListRelationFilter, {
    nullable: true
  })
  transactions?: TransactionListRelationFilter | undefined;
}
