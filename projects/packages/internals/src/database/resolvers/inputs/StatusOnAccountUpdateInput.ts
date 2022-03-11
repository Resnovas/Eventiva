import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountUpdateOneRequiredWithoutStatusInput } from "../inputs/AccountUpdateOneRequiredWithoutStatusInput";
import { DateTimeFieldUpdateOperationsInput } from "../inputs/DateTimeFieldUpdateOperationsInput";
import { NullableDateTimeFieldUpdateOperationsInput } from "../inputs/NullableDateTimeFieldUpdateOperationsInput";
import { StatusUpdateOneRequiredWithoutAccountInput } from "../inputs/StatusUpdateOneRequiredWithoutAccountInput";

@TypeGraphQL.InputType("StatusOnAccountUpdateInput", {
  isAbstract: true
})
export class StatusOnAccountUpdateInput {
  @TypeGraphQL.Field(_type => StatusUpdateOneRequiredWithoutAccountInput, {
    nullable: true
  })
  status?: StatusUpdateOneRequiredWithoutAccountInput | undefined;

  @TypeGraphQL.Field(_type => AccountUpdateOneRequiredWithoutStatusInput, {
    nullable: true
  })
  account?: AccountUpdateOneRequiredWithoutStatusInput | undefined;

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
