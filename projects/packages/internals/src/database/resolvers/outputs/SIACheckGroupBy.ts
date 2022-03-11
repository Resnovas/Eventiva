import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SIACheckAvgAggregate } from "../outputs/SIACheckAvgAggregate";
import { SIACheckCountAggregate } from "../outputs/SIACheckCountAggregate";
import { SIACheckMaxAggregate } from "../outputs/SIACheckMaxAggregate";
import { SIACheckMinAggregate } from "../outputs/SIACheckMinAggregate";
import { SIACheckSumAggregate } from "../outputs/SIACheckSumAggregate";
import { BadgeStatus } from "../../enums/BadgeStatus";

@TypeGraphQL.ObjectType("SIACheckGroupBy", {
  isAbstract: true
})
export class SIACheckGroupBy {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  id!: string;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  sia_id!: number | null;

  @TypeGraphQL.Field(_type => BadgeStatus, {
    nullable: false
  })
  status!: "ACTIVE" | "REVOKED" | "SUSPENDED" | "NON_ACTIVE";

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  AuthUrl!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  pubUrl!: string | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  createdAt!: Date;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  updatedAt!: Date;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deleted!: Date | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  error!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  transactionId!: string | null;

  @TypeGraphQL.Field(_type => SIACheckCountAggregate, {
    nullable: true
  })
  _count!: SIACheckCountAggregate | null;

  @TypeGraphQL.Field(_type => SIACheckAvgAggregate, {
    nullable: true
  })
  _avg!: SIACheckAvgAggregate | null;

  @TypeGraphQL.Field(_type => SIACheckSumAggregate, {
    nullable: true
  })
  _sum!: SIACheckSumAggregate | null;

  @TypeGraphQL.Field(_type => SIACheckMinAggregate, {
    nullable: true
  })
  _min!: SIACheckMinAggregate | null;

  @TypeGraphQL.Field(_type => SIACheckMaxAggregate, {
    nullable: true
  })
  _max!: SIACheckMaxAggregate | null;
}
