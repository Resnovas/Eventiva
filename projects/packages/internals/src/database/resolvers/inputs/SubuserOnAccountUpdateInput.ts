import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountUpdateOneRequiredWithoutAccessesInput } from "../inputs/AccountUpdateOneRequiredWithoutAccessesInput";
import { AccountUpdateOneRequiredWithoutSubusersInput } from "../inputs/AccountUpdateOneRequiredWithoutSubusersInput";
import { DateTimeFieldUpdateOperationsInput } from "../inputs/DateTimeFieldUpdateOperationsInput";

@TypeGraphQL.InputType("SubuserOnAccountUpdateInput", {
  isAbstract: true
})
export class SubuserOnAccountUpdateInput {
  @TypeGraphQL.Field(_type => AccountUpdateOneRequiredWithoutAccessesInput, {
    nullable: true
  })
  account?: AccountUpdateOneRequiredWithoutAccessesInput | undefined;

  @TypeGraphQL.Field(_type => AccountUpdateOneRequiredWithoutSubusersInput, {
    nullable: true
  })
  subuser?: AccountUpdateOneRequiredWithoutSubusersInput | undefined;

  @TypeGraphQL.Field(_type => DateTimeFieldUpdateOperationsInput, {
    nullable: true
  })
  createdAt?: DateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => DateTimeFieldUpdateOperationsInput, {
    nullable: true
  })
  updatedAt?: DateTimeFieldUpdateOperationsInput | undefined;
}
