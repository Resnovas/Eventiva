import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RoomCreateWithoutFeaturesOfRoomInput } from "../inputs/RoomCreateWithoutFeaturesOfRoomInput";
import { RoomUpdateWithoutFeaturesOfRoomInput } from "../inputs/RoomUpdateWithoutFeaturesOfRoomInput";

@TypeGraphQL.InputType("RoomUpsertWithoutFeaturesOfRoomInput", {
  isAbstract: true
})
export class RoomUpsertWithoutFeaturesOfRoomInput {
  @TypeGraphQL.Field(_type => RoomUpdateWithoutFeaturesOfRoomInput, {
    nullable: false
  })
  update!: RoomUpdateWithoutFeaturesOfRoomInput;

  @TypeGraphQL.Field(_type => RoomCreateWithoutFeaturesOfRoomInput, {
    nullable: false
  })
  create!: RoomCreateWithoutFeaturesOfRoomInput;
}
