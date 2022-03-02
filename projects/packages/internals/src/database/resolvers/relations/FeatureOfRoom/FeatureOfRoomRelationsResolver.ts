import * as TypeGraphQL from 'type-graphql';
import { Feature } from '../../../models/Feature';
import { FeatureOfRoom } from '../../../models/FeatureOfRoom';
import { Room } from '../../../models/Room';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => FeatureOfRoom)
export class FeatureOfRoomRelationsResolver {
  @TypeGraphQL.FieldResolver((_type) => Feature, {
    nullable: false,
  })
  async feature(
    @TypeGraphQL.Root() featureOfRoom: FeatureOfRoom,
    @TypeGraphQL.Ctx() ctx: any
  ): Promise<Feature> {
    return getPrismaFromContext(ctx)
      .featureOfRoom.findUnique({
        where: {
          roomId_featureId: {
            roomId: featureOfRoom.roomId,
            featureId: featureOfRoom.featureId,
          },
        },
      })
      .feature({});
  }

  @TypeGraphQL.FieldResolver((_type) => Room, {
    nullable: false,
  })
  async room(
    @TypeGraphQL.Root() featureOfRoom: FeatureOfRoom,
    @TypeGraphQL.Ctx() ctx: any
  ): Promise<Room> {
    return getPrismaFromContext(ctx)
      .featureOfRoom.findUnique({
        where: {
          roomId_featureId: {
            roomId: featureOfRoom.roomId,
            featureId: featureOfRoom.featureId,
          },
        },
      })
      .room({});
  }
}
