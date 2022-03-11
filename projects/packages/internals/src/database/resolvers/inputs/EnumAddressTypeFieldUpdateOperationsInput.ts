import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AddressType } from "../../enums/AddressType";

@TypeGraphQL.InputType("EnumAddressTypeFieldUpdateOperationsInput", {
  isAbstract: true
})
export class EnumAddressTypeFieldUpdateOperationsInput {
  @TypeGraphQL.Field(_type => AddressType, {
    nullable: true
  })
  set?: "PERSONAL" | "BUSINESS" | undefined;
}
