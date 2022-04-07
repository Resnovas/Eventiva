import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AddressCreateNestedOneWithoutRoomsInput } from "../inputs/AddressCreateNestedOneWithoutRoomsInput";
import { ArrangementOfRoomCreateNestedManyWithoutRoomInput } from "../inputs/ArrangementOfRoomCreateNestedManyWithoutRoomInput";

@TypeGraphQL.InputType("RoomCreateWithoutFeaturesOfRoomInput", {
  isAbstract: true
})
export class RoomCreateWithoutFeaturesOfRoomInput {
  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  id?: string | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  updatedAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deletedDate?: Date | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  deleted?: boolean | undefined;

  @TypeGraphQL.Field(_type => AddressCreateNestedOneWithoutRoomsInput, {
    nullable: false
  })
  address!: AddressCreateNestedOneWithoutRoomsInput;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  name!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  floor?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  building?: string | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  accessibility?: boolean | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  checkin?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  checkout?: Date | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  length?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  width?: string | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  height?: string | undefined;

  @TypeGraphQL.Field(_type => ArrangementOfRoomCreateNestedManyWithoutRoomInput, {
    nullable: true
  })
  arrangements?: ArrangementOfRoomCreateNestedManyWithoutRoomInput | undefined;
}
