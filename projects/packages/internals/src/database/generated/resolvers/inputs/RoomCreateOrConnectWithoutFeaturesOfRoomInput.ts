import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RoomCreateWithoutFeaturesOfRoomInput } from "../inputs/RoomCreateWithoutFeaturesOfRoomInput";
import { RoomWhereUniqueInput } from "../inputs/RoomWhereUniqueInput";

@TypeGraphQL.InputType("RoomCreateOrConnectWithoutFeaturesOfRoomInput", {
  isAbstract: true
})
export class RoomCreateOrConnectWithoutFeaturesOfRoomInput {
  @TypeGraphQL.Field(_type => RoomWhereUniqueInput, {
    nullable: false
  })
  where!: RoomWhereUniqueInput;

  @TypeGraphQL.Field(_type => RoomCreateWithoutFeaturesOfRoomInput, {
    nullable: false
  })
  create!: RoomCreateWithoutFeaturesOfRoomInput;
}
