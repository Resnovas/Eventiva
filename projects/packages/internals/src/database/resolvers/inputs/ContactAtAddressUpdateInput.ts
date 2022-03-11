import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountUpdateOneRequiredWithoutContactOfAddressInput } from "../inputs/AccountUpdateOneRequiredWithoutContactOfAddressInput";
import { AddressUpdateOneRequiredWithoutContactsInput } from "../inputs/AddressUpdateOneRequiredWithoutContactsInput";
import { DateTimeFieldUpdateOperationsInput } from "../inputs/DateTimeFieldUpdateOperationsInput";
import { EmailUpdateOneWithoutAssociatedContactInput } from "../inputs/EmailUpdateOneWithoutAssociatedContactInput";
import { NullableDateTimeFieldUpdateOperationsInput } from "../inputs/NullableDateTimeFieldUpdateOperationsInput";
import { NullableStringFieldUpdateOperationsInput } from "../inputs/NullableStringFieldUpdateOperationsInput";

@TypeGraphQL.InputType("ContactAtAddressUpdateInput", {
  isAbstract: true
})
export class ContactAtAddressUpdateInput {
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

  @TypeGraphQL.Field(_type => EmailUpdateOneWithoutAssociatedContactInput, {
    nullable: true
  })
  email?: EmailUpdateOneWithoutAssociatedContactInput | undefined;

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
  deleted?: NullableDateTimeFieldUpdateOperationsInput | undefined;
}
