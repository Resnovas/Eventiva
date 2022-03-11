import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RoomCreateOrConnectWithoutFeaturesOfRoomInput } from "../inputs/RoomCreateOrConnectWithoutFeaturesOfRoomInput";
import { RoomCreateWithoutFeaturesOfRoomInput } from "../inputs/RoomCreateWithoutFeaturesOfRoomInput";
import { RoomUpdateWithoutFeaturesOfRoomInput } from "../inputs/RoomUpdateWithoutFeaturesOfRoomInput";
import { RoomUpsertWithoutFeaturesOfRoomInput } from "../inputs/RoomUpsertWithoutFeaturesOfRoomInput";
import { RoomWhereUniqueInput } from "../inputs/RoomWhereUniqueInput";

@TypeGraphQL.InputType("RoomUpdateOneRequiredWithoutFeaturesOfRoomInput", {
  isAbstract: true
})
export class RoomUpdateOneRequiredWithoutFeaturesOfRoomInput {
  @TypeGraphQL.Field(_type => RoomCreateWithoutFeaturesOfRoomInput, {
    nullable: true
  })
  create?: RoomCreateWithoutFeaturesOfRoomInput | undefined;

  @TypeGraphQL.Field(_type => RoomCreateOrConnectWithoutFeaturesOfRoomInput, {
    nullable: true
  })
  connectOrCreate?: RoomCreateOrConnectWithoutFeaturesOfRoomInput | undefined;

  @TypeGraphQL.Field(_type => RoomUpsertWithoutFeaturesOfRoomInput, {
    nullable: true
  })
  upsert?: RoomUpsertWithoutFeaturesOfRoomInput | undefined;

  @TypeGraphQL.Field(_type => RoomWhereUniqueInput, {
    nullable: true
  })
  connect?: RoomWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => RoomUpdateWithoutFeaturesOfRoomInput, {
    nullable: true
  })
  update?: RoomUpdateWithoutFeaturesOfRoomInput | undefined;
}
