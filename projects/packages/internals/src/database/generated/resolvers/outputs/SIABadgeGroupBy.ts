import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SIABadgeAvgAggregate } from "../outputs/SIABadgeAvgAggregate";
import { SIABadgeCountAggregate } from "../outputs/SIABadgeCountAggregate";
import { SIABadgeMaxAggregate } from "../outputs/SIABadgeMaxAggregate";
import { SIABadgeMinAggregate } from "../outputs/SIABadgeMinAggregate";
import { SIABadgeSumAggregate } from "../outputs/SIABadgeSumAggregate";
import { LicenseSector } from "../../enums/LicenseSector";
import { LicenseType } from "../../enums/LicenseType";

@TypeGraphQL.ObjectType("SIABadgeGroupBy", {
  isAbstract: true
})
export class SIABadgeGroupBy {
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
    nullable: false
  })
  createdAt!: Date;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  active!: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  expiry!: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  updatedAt!: Date;

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

  @TypeGraphQL.Field(_type => SIABadgeCountAggregate, {
    nullable: true
  })
  _count!: SIABadgeCountAggregate | null;

  @TypeGraphQL.Field(_type => SIABadgeAvgAggregate, {
    nullable: true
  })
  _avg!: SIABadgeAvgAggregate | null;

  @TypeGraphQL.Field(_type => SIABadgeSumAggregate, {
    nullable: true
  })
  _sum!: SIABadgeSumAggregate | null;

  @TypeGraphQL.Field(_type => SIABadgeMinAggregate, {
    nullable: true
  })
  _min!: SIABadgeMinAggregate | null;

  @TypeGraphQL.Field(_type => SIABadgeMaxAggregate, {
    nullable: true
  })
  _max!: SIABadgeMaxAggregate | null;
}
