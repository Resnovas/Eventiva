import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FeatureCountAggregate } from "../outputs/FeatureCountAggregate";
import { FeatureMaxAggregate } from "../outputs/FeatureMaxAggregate";
import { FeatureMinAggregate } from "../outputs/FeatureMinAggregate";

@TypeGraphQL.ObjectType("AggregateFeature", {
  isAbstract: true
})
export class AggregateFeature {
  @TypeGraphQL.Field(_type => FeatureCountAggregate, {
    nullable: true
  })
  _count!: FeatureCountAggregate | null;

  @TypeGraphQL.Field(_type => FeatureMinAggregate, {
    nullable: true
  })
  _min!: FeatureMinAggregate | null;

  @TypeGraphQL.Field(_type => FeatureMaxAggregate, {
    nullable: true
  })
  _max!: FeatureMaxAggregate | null;
}
