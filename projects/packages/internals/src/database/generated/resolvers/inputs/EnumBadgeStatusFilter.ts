import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { NestedEnumBadgeStatusFilter } from "../inputs/NestedEnumBadgeStatusFilter";
import { BadgeStatus } from "../../enums/BadgeStatus";

@TypeGraphQL.InputType("EnumBadgeStatusFilter", {
  isAbstract: true
})
export class EnumBadgeStatusFilter {
  @TypeGraphQL.Field(_type => BadgeStatus, {
    nullable: true
  })
  equals?: "ACTIVE" | "REVOKED" | "SUSPENDED" | "NON_ACTIVE" | undefined;

  @TypeGraphQL.Field(_type => [BadgeStatus], {
    nullable: true
  })
  in?: Array<"ACTIVE" | "REVOKED" | "SUSPENDED" | "NON_ACTIVE"> | undefined;

  @TypeGraphQL.Field(_type => [BadgeStatus], {
    nullable: true
  })
  notIn?: Array<"ACTIVE" | "REVOKED" | "SUSPENDED" | "NON_ACTIVE"> | undefined;

  @TypeGraphQL.Field(_type => NestedEnumBadgeStatusFilter, {
    nullable: true
  })
  not?: NestedEnumBadgeStatusFilter | undefined;
}
