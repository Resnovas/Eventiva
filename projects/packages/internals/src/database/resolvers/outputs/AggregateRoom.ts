import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RoomCountAggregate } from "../outputs/RoomCountAggregate";
import { RoomMaxAggregate } from "../outputs/RoomMaxAggregate";
import { RoomMinAggregate } from "../outputs/RoomMinAggregate";

@TypeGraphQL.ObjectType("AggregateRoom", {
  isAbstract: true
})
export class AggregateRoom {
  @TypeGraphQL.Field(_type => RoomCountAggregate, {
    nullable: true
  })
  _count!: RoomCountAggregate | null;

  @TypeGraphQL.Field(_type => RoomMinAggregate, {
    nullable: true
  })
  _min!: RoomMinAggregate | null;

  @TypeGraphQL.Field(_type => RoomMaxAggregate, {
    nullable: true
  })
  _max!: RoomMaxAggregate | null;
}
