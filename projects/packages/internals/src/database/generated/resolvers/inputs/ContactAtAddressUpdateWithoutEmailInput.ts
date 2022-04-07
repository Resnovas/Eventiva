import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountUpdateOneRequiredWithoutContactOfAddressInput } from "../inputs/AccountUpdateOneRequiredWithoutContactOfAddressInput";
import { AddressUpdateOneRequiredWithoutContactsInput } from "../inputs/AddressUpdateOneRequiredWithoutContactsInput";
import { DateTimeFieldUpdateOperationsInput } from "../inputs/DateTimeFieldUpdateOperationsInput";
import { NullableBoolFieldUpdateOperationsInput } from "../inputs/NullableBoolFieldUpdateOperationsInput";
import { NullableDateTimeFieldUpdateOperationsInput } from "../inputs/NullableDateTimeFieldUpdateOperationsInput";
import { NullableStringFieldUpdateOperationsInput } from "../inputs/NullableStringFieldUpdateOperationsInput";

@TypeGraphQL.InputType("ContactAtAddressUpdateWithoutEmailInput", {
  isAbstract: true
})
export class ContactAtAddressUpdateWithoutEmailInput {
  @TypeGraphQL.Field(_type => AccountUpdateOneRequiredWithoutContactOfAddressInput, {
    nullable: true
  })
  account?: AccountUpdateOneRequiredWithoutContactOfAddressInput | undefined;

  @TypeGraphQL.Field(_type => AddressUpdateOneRequiredWithoutContactsInput, {
    nullable: true
  })
  address?: AddressUpdateOneRequiredWithoutContactsInput | undefined;

  @TypeGraphQL.Field(_type => NullableStringFieldUpdateOperationsInput, {
    nullable: true
  })
  jobTitle?: NullableStringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => NullableStringFieldUpdateOperationsInput, {
    nullable: true
  })
  phone?: NullableStringFieldUpdateOperationsInput | undefined;

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
  deletedDate?: NullableDateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => NullableBoolFieldUpdateOperationsInput, {
    nullable: true
  })
  deleted?: NullableBoolFieldUpdateOperationsInput | undefined;
}
