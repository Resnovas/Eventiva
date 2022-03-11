import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SIABadgeAvgAggregate } from "../outputs/SIABadgeAvgAggregate";
import { SIABadgeCountAggregate } from "../outputs/SIABadgeCountAggregate";
import { SIABadgeMaxAggregate } from "../outputs/SIABadgeMaxAggregate";
import { SIABadgeMinAggregate } from "../outputs/SIABadgeMinAggregate";
import { SIABadgeSumAggregate } from "../outputs/SIABadgeSumAggregate";

@TypeGraphQL.ObjectType("AggregateSIABadge", {
  isAbstract: true
})
export class AggregateSIABadge {
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
