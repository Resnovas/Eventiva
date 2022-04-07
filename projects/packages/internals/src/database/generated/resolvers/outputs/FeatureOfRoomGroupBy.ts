import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { FeatureOfRoomCountAggregate } from "../outputs/FeatureOfRoomCountAggregate";
import { FeatureOfRoomMaxAggregate } from "../outputs/FeatureOfRoomMaxAggregate";
import { FeatureOfRoomMinAggregate } from "../outputs/FeatureOfRoomMinAggregate";

@TypeGraphQL.ObjectType("FeatureOfRoomGroupBy", {
  isAbstract: true
})
export class FeatureOfRoomGroupBy {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  roomId!: string;

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

  @TypeGraphQL.Field(_type => FeatureOfRoomCountAggregate, {
    nullable: true
  })
  _count!: FeatureOfRoomCountAggregate | null;

  @TypeGraphQL.Field(_type => FeatureOfRoomMinAggregate, {
    nullable: true
  })
  _min!: FeatureOfRoomMinAggregate | null;

  @TypeGraphQL.Field(_type => FeatureOfRoomMaxAggregate, {
    nullable: true
  })
  _max!: FeatureOfRoomMaxAggregate | null;
}
