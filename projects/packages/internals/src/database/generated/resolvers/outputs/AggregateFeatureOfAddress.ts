import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FeatureOfAddressCountAggregate } from "../outputs/FeatureOfAddressCountAggregate";
import { FeatureOfAddressMaxAggregate } from "../outputs/FeatureOfAddressMaxAggregate";
import { FeatureOfAddressMinAggregate } from "../outputs/FeatureOfAddressMinAggregate";

@TypeGraphQL.ObjectType("AggregateFeatureOfAddress", {
  isAbstract: true
})
export class AggregateFeatureOfAddress {
  @TypeGraphQL.Field(_type => FeatureOfAddressCountAggregate, {
    nullable: true
  })
  _count!: FeatureOfAddressCountAggregate | null;

  @TypeGraphQL.Field(_type => FeatureOfAddressMinAggregate, {
    nullable: true
  })
  _min!: FeatureOfAddressMinAggregate | null;

  @TypeGraphQL.Field(_type => FeatureOfAddressMaxAggregate, {
    nullable: true
  })
  _max!: FeatureOfAddressMaxAggregate | null;
}
