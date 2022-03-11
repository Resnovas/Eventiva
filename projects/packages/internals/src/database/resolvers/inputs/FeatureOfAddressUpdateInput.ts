import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AddressUpdateOneRequiredWithoutFeaturesOfBuisnessInput } from "../inputs/AddressUpdateOneRequiredWithoutFeaturesOfBuisnessInput";
import { DateTimeFieldUpdateOperationsInput } from "../inputs/DateTimeFieldUpdateOperationsInput";
import { FeatureUpdateOneRequiredWithoutFeatureOfAddressInput } from "../inputs/FeatureUpdateOneRequiredWithoutFeatureOfAddressInput";
import { NullableDateTimeFieldUpdateOperationsInput } from "../inputs/NullableDateTimeFieldUpdateOperationsInput";

@TypeGraphQL.InputType("FeatureOfAddressUpdateInput", {
  isAbstract: true
})
export class FeatureOfAddressUpdateInput {
  @TypeGraphQL.Field(_type => FeatureUpdateOneRequiredWithoutFeatureOfAddressInput, {
    nullable: true
  })
  feature?: FeatureUpdateOneRequiredWithoutFeatureOfAddressInput | undefined;

  @TypeGraphQL.Field(_type => AddressUpdateOneRequiredWithoutFeaturesOfBuisnessInput, {
    nullable: true
  })
  address?: AddressUpdateOneRequiredWithoutFeaturesOfBuisnessInput | undefined;

  @TypeGraphQL.Field(_type => GraphQLScalars.JSONResolver, {
    nullable: true
  })
  data?: Prisma.InputJsonValue | undefined;

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
