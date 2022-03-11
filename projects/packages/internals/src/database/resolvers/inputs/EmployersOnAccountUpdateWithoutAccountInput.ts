import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountUpdateOneRequiredWithoutEmployeesInput } from "../inputs/AccountUpdateOneRequiredWithoutEmployeesInput";
import { DateTimeFieldUpdateOperationsInput } from "../inputs/DateTimeFieldUpdateOperationsInput";

@TypeGraphQL.InputType("EmployersOnAccountUpdateWithoutAccountInput", {
  isAbstract: true
})
export class EmployersOnAccountUpdateWithoutAccountInput {
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
}
