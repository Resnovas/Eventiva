import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RoomCreateOrConnectWithoutFeaturesOfRoomInput } from "../inputs/RoomCreateOrConnectWithoutFeaturesOfRoomInput";
import { RoomCreateWithoutFeaturesOfRoomInput } from "../inputs/RoomCreateWithoutFeaturesOfRoomInput";
import { RoomWhereUniqueInput } from "../inputs/RoomWhereUniqueInput";

@TypeGraphQL.InputType("RoomCreateNestedOneWithoutFeaturesOfRoomInput", {
  isAbstract: true
})
export class RoomCreateNestedOneWithoutFeaturesOfRoomInput {
  @TypeGraphQL.Field(_type => RoomCreateWithoutFeaturesOfRoomInput, {
    nullable: true
  })
  create?: RoomCreateWithoutFeaturesOfRoomInput | undefined;

  @TypeGraphQL.Field(_type => RoomCreateOrConnectWithoutFeaturesOfRoomInput, {
    nullable: true
  })
  connectOrCreate?: RoomCreateOrConnectWithoutFeaturesOfRoomInput | undefined;

  @TypeGraphQL.Field(_type => RoomWhereUniqueInput, {
    nullable: true
  })
  connect?: RoomWhereUniqueInput | undefined;
}
