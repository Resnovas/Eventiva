import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AddressUpdateManyWithoutAccountInput } from "../inputs/AddressUpdateManyWithoutAccountInput";
import { AddressUpdateOneWithoutPrimaryAccountInput } from "../inputs/AddressUpdateOneWithoutPrimaryAccountInput";
import { ApplicationUpdateManyWithoutAccountInput } from "../inputs/ApplicationUpdateManyWithoutAccountInput";
import { BoolFieldUpdateOperationsInput } from "../inputs/BoolFieldUpdateOperationsInput";
import { ContactAtAddressUpdateManyWithoutAccountInput } from "../inputs/ContactAtAddressUpdateManyWithoutAccountInput";
import { DateTimeFieldUpdateOperationsInput } from "../inputs/DateTimeFieldUpdateOperationsInput";
import { EmailUpdateManyWithoutAccountInput } from "../inputs/EmailUpdateManyWithoutAccountInput";
import { EmployersOnAccountUpdateManyWithoutAccountInput } from "../inputs/EmployersOnAccountUpdateManyWithoutAccountInput";
import { EmployersOnAccountUpdateManyWithoutEmployerInput } from "../inputs/EmployersOnAccountUpdateManyWithoutEmployerInput";
import { EnumAccountTypeFieldUpdateOperationsInput } from "../inputs/EnumAccountTypeFieldUpdateOperationsInput";
import { FilesUpdateManyWithoutAccountInput } from "../inputs/FilesUpdateManyWithoutAccountInput";
import { IntFieldUpdateOperationsInput } from "../inputs/IntFieldUpdateOperationsInput";
import { ManagersOnAccountUpdateManyWithoutManagersInput } from "../inputs/ManagersOnAccountUpdateManyWithoutManagersInput";
import { NullableBoolFieldUpdateOperationsInput } from "../inputs/NullableBoolFieldUpdateOperationsInput";
import { NullableDateTimeFieldUpdateOperationsInput } from "../inputs/NullableDateTimeFieldUpdateOperationsInput";
import { NullableEnumTitleFieldUpdateOperationsInput } from "../inputs/NullableEnumTitleFieldUpdateOperationsInput";
import { NullableStringFieldUpdateOperationsInput } from "../inputs/NullableStringFieldUpdateOperationsInput";
import { PhoneUpdateManyWithoutAccountInput } from "../inputs/PhoneUpdateManyWithoutAccountInput";
import { RTWUpdateManyWithoutAccountInput } from "../inputs/RTWUpdateManyWithoutAccountInput";
import { SIABadgeUpdateManyWithoutAccountInput } from "../inputs/SIABadgeUpdateManyWithoutAccountInput";
import { SaltUpdateOneWithoutAccountInput } from "../inputs/SaltUpdateOneWithoutAccountInput";
import { StatusOnAccountUpdateManyWithoutAccountInput } from "../inputs/StatusOnAccountUpdateManyWithoutAccountInput";
import { StringFieldUpdateOperationsInput } from "../inputs/StringFieldUpdateOperationsInput";
import { SubscriptionOnAccountUpdateManyWithoutAccountInput } from "../inputs/SubscriptionOnAccountUpdateManyWithoutAccountInput";
import { SubuserOnAccountUpdateManyWithoutAccountInput } from "../inputs/SubuserOnAccountUpdateManyWithoutAccountInput";
import { SubuserOnAccountUpdateManyWithoutSubuserInput } from "../inputs/SubuserOnAccountUpdateManyWithoutSubuserInput";
import { TokenUpdateManyWithoutAccountInput } from "../inputs/TokenUpdateManyWithoutAccountInput";
import { TransactionUpdateManyWithoutAccountInput } from "../inputs/TransactionUpdateManyWithoutAccountInput";

@TypeGraphQL.InputType("AccountUpdateWithoutAccountsInput", {
  isAbstract: true
})
export class AccountUpdateWithoutAccountsInput {
  @TypeGraphQL.Field(_type => StringFieldUpdateOperationsInput, {
    nullable: true
  })
  id?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => IntFieldUpdateOperationsInput, {
    nullable: true
  })
  prn?: IntFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => NullableStringFieldUpdateOperationsInput, {
    nullable: true
  })
  username?: NullableStringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => EnumAccountTypeFieldUpdateOperationsInput, {
    nullable: true
  })
  accountType?: EnumAccountTypeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => BoolFieldUpdateOperationsInput, {
    nullable: true
  })
  subsciption?: BoolFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => EmployersOnAccountUpdateManyWithoutAccountInput, {
    nullable: true
  })
  employer?: EmployersOnAccountUpdateManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => EmployersOnAccountUpdateManyWithoutEmployerInput, {
    nullable: true
  })
  employees?: EmployersOnAccountUpdateManyWithoutEmployerInput | undefined;

  @TypeGraphQL.Field(_type => SubuserOnAccountUpdateManyWithoutAccountInput, {
    nullable: true
  })
  accesses?: SubuserOnAccountUpdateManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => SubuserOnAccountUpdateManyWithoutSubuserInput, {
    nullable: true
  })
  subusers?: SubuserOnAccountUpdateManyWithoutSubuserInput | undefined;

  @TypeGraphQL.Field(_type => ManagersOnAccountUpdateManyWithoutManagersInput, {
    nullable: true
  })
  managers?: ManagersOnAccountUpdateManyWithoutManagersInput | undefined;

  @TypeGraphQL.Field(_type => DateTimeFieldUpdateOperationsInput, {
    nullable: true
  })
  createdAt?: DateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => DateTimeFieldUpdateOperationsInput, {
    nullable: true
  })
  updatedAt?: DateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => NullableDateTimeFieldUpdateOperationsInput, {
    nullable: true
  })
  lastLogin?: NullableDateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => NullableDateTimeFieldUpdateOperationsInput, {
    nullable: true
  })
  applied?: NullableDateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => NullableDateTimeFieldUpdateOperationsInput, {
    nullable: true
  })
  promoted?: NullableDateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => NullableDateTimeFieldUpdateOperationsInput, {
    nullable: true
  })
  retired?: NullableDateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => NullableEnumTitleFieldUpdateOperationsInput, {
    nullable: true
  })
  title?: NullableEnumTitleFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => NullableStringFieldUpdateOperationsInput, {
    nullable: true
  })
  firstname?: NullableStringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => NullableStringFieldUpdateOperationsInput, {
    nullable: true
  })
  midname?: NullableStringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => NullableStringFieldUpdateOperationsInput, {
    nullable: true
  })
  lastname?: NullableStringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => NullableStringFieldUpdateOperationsInput, {
    nullable: true
  })
  Salutation?: NullableStringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => NullableDateTimeFieldUpdateOperationsInput, {
    nullable: true
  })
  dob?: NullableDateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => NullableStringFieldUpdateOperationsInput, {
    nullable: true
  })
  sex?: NullableStringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => StringFieldUpdateOperationsInput, {
    nullable: true
  })
  label?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => NullableStringFieldUpdateOperationsInput, {
    nullable: true
  })
  password?: NullableStringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => SaltUpdateOneWithoutAccountInput, {
    nullable: true
  })
  Salt?: SaltUpdateOneWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => NullableStringFieldUpdateOperationsInput, {
    nullable: true
  })
  resetPasswordToken?: NullableStringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => NullableDateTimeFieldUpdateOperationsInput, {
    nullable: true
  })
  resetPasswordExpires?: NullableDateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => TokenUpdateManyWithoutAccountInput, {
    nullable: true
  })
  apiToken?: TokenUpdateManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => NullableDateTimeFieldUpdateOperationsInput, {
    nullable: true
  })
  deletedDate?: NullableDateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => NullableBoolFieldUpdateOperationsInput, {
    nullable: true
  })
  deleted?: NullableBoolFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => AddressUpdateOneWithoutPrimaryAccountInput, {
    nullable: true
  })
  primaryAddress?: AddressUpdateOneWithoutPrimaryAccountInput | undefined;

  @TypeGraphQL.Field(_type => AddressUpdateManyWithoutAccountInput, {
    nullable: true
  })
  addresses?: AddressUpdateManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => ContactAtAddressUpdateManyWithoutAccountInput, {
    nullable: true
  })
  contactOfAddress?: ContactAtAddressUpdateManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => ApplicationUpdateManyWithoutAccountInput, {
    nullable: true
  })
  application?: ApplicationUpdateManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => EmailUpdateManyWithoutAccountInput, {
    nullable: true
  })
  emails?: EmailUpdateManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => FilesUpdateManyWithoutAccountInput, {
    nullable: true
  })
  files?: FilesUpdateManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => PhoneUpdateManyWithoutAccountInput, {
    nullable: true
  })
  phones?: PhoneUpdateManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => RTWUpdateManyWithoutAccountInput, {
    nullable: true
  })
  rtw?: RTWUpdateManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => SIABadgeUpdateManyWithoutAccountInput, {
    nullable: true
  })
  sia?: SIABadgeUpdateManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => StatusOnAccountUpdateManyWithoutAccountInput, {
    nullable: true
  })
  Status?: StatusOnAccountUpdateManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => SubscriptionOnAccountUpdateManyWithoutAccountInput, {
    nullable: true
  })
  subscription?: SubscriptionOnAccountUpdateManyWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => TransactionUpdateManyWithoutAccountInput, {
    nullable: true
  })
  transactions?: TransactionUpdateManyWithoutAccountInput | undefined;
}
