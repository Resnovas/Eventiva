import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { NestedEnumLicenseTypeFilter } from "../inputs/NestedEnumLicenseTypeFilter";
import { NestedIntFilter } from "../inputs/NestedIntFilter";
import { LicenseType } from "../../enums/LicenseType";

@TypeGraphQL.InputType("NestedEnumLicenseTypeWithAggregatesFilter", {
  isAbstract: true
})
export class NestedEnumLicenseTypeWithAggregatesFilter {
  @TypeGraphQL.Field(_type => LicenseType, {
    nullable: true
  })
  equals?: "FRONTLINE" | "NON_FRONTLINE" | undefined;

  @TypeGraphQL.Field(_type => [LicenseType], {
    nullable: true
  })
  in?: Array<"FRONTLINE" | "NON_FRONTLINE"> | undefined;

  @TypeGraphQL.Field(_type => [LicenseType], {
    nullable: true
  })
  notIn?: Array<"FRONTLINE" | "NON_FRONTLINE"> | undefined;

  @TypeGraphQL.Field(_type => NestedEnumLicenseTypeWithAggregatesFilter, {
    nullable: true
  })
  not?: NestedEnumLicenseTypeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => NestedIntFilter, {
    nullable: true
  })
  _count?: NestedIntFilter | undefined;

  @TypeGraphQL.Field(_type => NestedEnumLicenseTypeFilter, {
    nullable: true
  })
  _min?: NestedEnumLicenseTypeFilter | undefined;

  @TypeGraphQL.Field(_type => NestedEnumLicenseTypeFilter, {
    nullable: true
  })
  _max?: NestedEnumLicenseTypeFilter | undefined;
}
