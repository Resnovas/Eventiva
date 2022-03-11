import * as TypeGraphQL from "type-graphql";
import { Address } from "../../../models/Address";
import { ArrangementOfRoom } from "../../../models/ArrangementOfRoom";
import { FeatureOfRoom } from "../../../models/FeatureOfRoom";
import { Room } from "../../../models/Room";
import { RoomArrangementsArgs } from "./args/RoomArrangementsArgs";
import { RoomFeaturesOfRoomArgs } from "./args/RoomFeaturesOfRoomArgs";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Room)
export class RoomRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => [FeatureOfRoom], {
    nullable: false
  })
  async featuresOfRoom(@TypeGraphQL.Root() room: Room, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: RoomFeaturesOfRoomArgs): Promise<FeatureOfRoom[]> {
    return getPrismaFromContext(ctx).room.findUnique({
      where: {
        id: room.id,
      },
    }).featuresOfRoom(args);
  }

  @TypeGraphQL.FieldResolver(_type => Address, {
    nullable: false
  })
  async address(@TypeGraphQL.Root() room: Room, @TypeGraphQL.Ctx() ctx: any): Promise<Address> {
    return getPrismaFromContext(ctx).room.findUnique({
      where: {
        id: room.id,
      },
    }).address({});
  }

  @TypeGraphQL.FieldResolver(_type => [ArrangementOfRoom], {
    nullable: false
  })
  async arrangements(@TypeGraphQL.Root() room: Room, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: RoomArrangementsArgs): Promise<ArrangementOfRoom[]> {
    return getPrismaFromContext(ctx).room.findUnique({
      where: {
        id: room.id,
      },
    }).arrangements(args);
  }
}
