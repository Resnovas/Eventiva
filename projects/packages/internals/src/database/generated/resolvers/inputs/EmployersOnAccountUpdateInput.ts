import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountUpdateOneRequiredWithoutEmployeesInput } from "../inputs/AccountUpdateOneRequiredWithoutEmployeesInput";
import { AccountUpdateOneRequiredWithoutEmployerInput } from "../inputs/AccountUpdateOneRequiredWithoutEmployerInput";
import { DateTimeFieldUpdateOperationsInput } from "../inputs/DateTimeFieldUpdateOperationsInput";
import { NullableBoolFieldUpdateOperationsInput } from "../inputs/NullableBoolFieldUpdateOperationsInput";
import { NullableDateTimeFieldUpdateOperationsInput } from "../inputs/NullableDateTimeFieldUpdateOperationsInput";

@TypeGraphQL.InputType("EmployersOnAccountUpdateInput", {
  isAbstract: true
})
export class EmployersOnAccountUpdateInput {
  @TypeGraphQL.Field(_type => AccountUpdateOneRequiredWithoutEmployerInput, {
    nullable: true
  })
  account?: AccountUpdateOneRequiredWithoutEmployerInput | undefined;

  @TypeGraphQL.Field(_type => AccountUpdateOneRequiredWithoutEmployeesInput, {
    nullable: true
  })
  employer?: AccountUpdateOneRequiredWithoutEmployeesInput | undefined;

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
