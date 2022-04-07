import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { BadgeStatus } from "../../enums/BadgeStatus";

@TypeGraphQL.InputType("EnumBadgeStatusFieldUpdateOperationsInput", {
  isAbstract: true
})
export class EnumBadgeStatusFieldUpdateOperationsInput {
  @TypeGraphQL.Field(_type => BadgeStatus, {
    nullable: true
  })
  set?: "ACTIVE" | "REVOKED" | "SUSPENDED" | "NON_ACTIVE" | undefined;
}
