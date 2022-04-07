import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DateTimeFieldUpdateOperationsInput } from "../inputs/DateTimeFieldUpdateOperationsInput";
import { FeatureUpdateOneRequiredWithoutFeatureOfAddressInput } from "../inputs/FeatureUpdateOneRequiredWithoutFeatureOfAddressInput";
import { NullableBoolFieldUpdateOperationsInput } from "../inputs/NullableBoolFieldUpdateOperationsInput";
import { NullableDateTimeFieldUpdateOperationsInput } from "../inputs/NullableDateTimeFieldUpdateOperationsInput";

@TypeGraphQL.InputType("FeatureOfAddressUpdateWithoutAddressInput", {
  isAbstract: true
})
export class FeatureOfAddressUpdateWithoutAddressInput {
  @TypeGraphQL.Field(_type => FeatureUpdateOneRequiredWithoutFeatureOfAddressInput, {
    nullable: true
  })
  feature?: FeatureUpdateOneRequiredWithoutFeatureOfAddressInput | undefined;

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
  deletedDate?: NullableDateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => NullableBoolFieldUpdateOperationsInput, {
    nullable: true
  })
  deleted?: NullableBoolFieldUpdateOperationsInput | undefined;
}
