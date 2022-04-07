import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ArrangementOfRoomAvgAggregate } from "../outputs/ArrangementOfRoomAvgAggregate";
import { ArrangementOfRoomCountAggregate } from "../outputs/ArrangementOfRoomCountAggregate";
import { ArrangementOfRoomMaxAggregate } from "../outputs/ArrangementOfRoomMaxAggregate";
import { ArrangementOfRoomMinAggregate } from "../outputs/ArrangementOfRoomMinAggregate";
import { ArrangementOfRoomSumAggregate } from "../outputs/ArrangementOfRoomSumAggregate";

@TypeGraphQL.ObjectType("ArrangementOfRoomGroupBy", {
  isAbstract: true
})
export class ArrangementOfRoomGroupBy {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  roomId!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  arrangementId!: string;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  capacity!: number;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  details!: string | null;

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

  @TypeGraphQL.Field(_type => ArrangementOfRoomCountAggregate, {
    nullable: true
  })
  _count!: ArrangementOfRoomCountAggregate | null;

  @TypeGraphQL.Field(_type => ArrangementOfRoomAvgAggregate, {
    nullable: true
  })
  _avg!: ArrangementOfRoomAvgAggregate | null;

  @TypeGraphQL.Field(_type => ArrangementOfRoomSumAggregate, {
    nullable: true
  })
  _sum!: ArrangementOfRoomSumAggregate | null;

  @TypeGraphQL.Field(_type => ArrangementOfRoomMinAggregate, {
    nullable: true
  })
  _min!: ArrangementOfRoomMinAggregate | null;

  @TypeGraphQL.Field(_type => ArrangementOfRoomMaxAggregate, {
    nullable: true
  })
  _max!: ArrangementOfRoomMaxAggregate | null;
}
