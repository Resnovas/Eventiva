import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../scalars";
import { Address } from "../models/Address";
import { ArrangementOfRoom } from "../models/ArrangementOfRoom";
import { FeatureOfRoom } from "../models/FeatureOfRoom";
import { RoomCount } from "../resolvers/outputs/RoomCount";

@TypeGraphQL.ObjectType("Room", {
  isAbstract: true
})
export class Room {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  id!: string;

  featuresOfRoom?: FeatureOfRoom[];

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
  deleted?: Date | null;

  address?: Address;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  addressId!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  name!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  floor?: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  building?: string | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  accessibility?: boolean | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  checkin?: Date | null;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  checkout?: Date | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  length?: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  width?: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  height?: string | null;

  arrangements?: ArrangementOfRoom[];

  @TypeGraphQL.Field(_type => RoomCount, {
    nullable: true
  })
  _count?: RoomCount | null;
}
