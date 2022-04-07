import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FeatureOfAddressCountAggregate } from "../outputs/FeatureOfAddressCountAggregate";
import { FeatureOfAddressMaxAggregate } from "../outputs/FeatureOfAddressMaxAggregate";
import { FeatureOfAddressMinAggregate } from "../outputs/FeatureOfAddressMinAggregate";

@TypeGraphQL.ObjectType("FeatureOfAddressGroupBy", {
  isAbstract: true
})
export class FeatureOfAddressGroupBy {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  addressId!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  featureId!: string;

  @TypeGraphQL.Field(_type => GraphQLScalars.JSONResolver, {
    nullable: true
  })
  data!: Prisma.JsonValue | null;

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
  deletedDate!: Date | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  deleted!: boolean | null;

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
