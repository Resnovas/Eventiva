import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountUpdateOneRequiredWithoutManagersInput } from "../inputs/AccountUpdateOneRequiredWithoutManagersInput";
import { DateTimeFieldUpdateOperationsInput } from "../inputs/DateTimeFieldUpdateOperationsInput";

@TypeGraphQL.InputType("ManagersOnAccountUpdateWithoutAccountInput", {
  isAbstract: true
})
export class ManagersOnAccountUpdateWithoutAccountInput {
  @TypeGraphQL.Field(_type => AccountUpdateOneRequiredWithoutManagersInput, {
    nullable: true
  })
  managers?: AccountUpdateOneRequiredWithoutManagersInput | undefined;

  @TypeGraphQL.Field(_type => DateTimeFieldUpdateOperationsInput, {
    nullable: true
  })
  createdAt?: DateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => DateTimeFieldUpdateOperationsInput, {
    nullable: true
  })
  updatedAt?: DateTimeFieldUpdateOperationsInput | undefined;
}
