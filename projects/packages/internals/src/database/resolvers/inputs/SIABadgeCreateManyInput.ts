import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { LicenseSector } from "../../enums/LicenseSector";
import { LicenseType } from "../../enums/LicenseType";

@TypeGraphQL.InputType("SIABadgeCreateManyInput", {
  isAbstract: true
})
export class SIABadgeCreateManyInput {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  id!: number;

  @TypeGraphQL.Field(_type => LicenseSector, {
    nullable: false
  })
  licenseSector!: "CVIT" | "CP" | "DS" | "CCTV" | "SG" | "VI" | "KH" | "UNKNOWN";

  @TypeGraphQL.Field(_type => LicenseType, {
    nullable: false
  })
  type!: "FRONTLINE" | "NON_FRONTLINE";

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  licenseExplanation!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  additionalTerms!: string;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  active?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  expiry?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  updatedAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deleted?: Date | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  account_id?: string | undefined;
}
