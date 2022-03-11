import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SIACheckAvgAggregate } from "../outputs/SIACheckAvgAggregate";
import { SIACheckCountAggregate } from "../outputs/SIACheckCountAggregate";
import { SIACheckMaxAggregate } from "../outputs/SIACheckMaxAggregate";
import { SIACheckMinAggregate } from "../outputs/SIACheckMinAggregate";
import { SIACheckSumAggregate } from "../outputs/SIACheckSumAggregate";

@TypeGraphQL.ObjectType("AggregateSIACheck", {
  isAbstract: true
})
export class AggregateSIACheck {
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
