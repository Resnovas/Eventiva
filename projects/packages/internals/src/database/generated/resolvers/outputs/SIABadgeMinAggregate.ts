import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { LicenseSector } from "../../enums/LicenseSector";
import { LicenseType } from "../../enums/LicenseType";

@TypeGraphQL.ObjectType("SIABadgeMinAggregate", {
  isAbstract: true
})
export class SIABadgeMinAggregate {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  id!: number | null;

  @TypeGraphQL.Field(_type => LicenseSector, {
    nullable: true
  })
  licenseSector!: "CVIT" | "CP" | "DS" | "CCTV" | "SG" | "VI" | "KH" | "UNKNOWN" | null;

  @TypeGraphQL.Field(_type => LicenseType, {
    nullable: true
  })
  type!: "FRONTLINE" | "NON_FRONTLINE" | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  licenseExplanation!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  additionalTerms!: string | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  createdAt!: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  active!: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  expiry!: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  updatedAt!: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deletedDate!: Date | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  deleted!: boolean | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  account_id!: string | null;
}
