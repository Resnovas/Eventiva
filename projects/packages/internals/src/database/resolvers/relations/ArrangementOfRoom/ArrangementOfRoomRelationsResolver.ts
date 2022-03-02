import * as TypeGraphQL from 'type-graphql';
import { Arrangement } from '../../../models/Arrangement';
import { ArrangementOfRoom } from '../../../models/ArrangementOfRoom';
import { Room } from '../../../models/Room';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => ArrangementOfRoom)
export class ArrangementOfRoomRelationsResolver {
  @TypeGraphQL.FieldResolver((_type) => Arrangement, {
    nullable: false,
  })
  async arrangement(
    @TypeGraphQL.Root() arrangementOfRoom: ArrangementOfRoom,
    @TypeGraphQL.Ctx() ctx: any
  ): Promise<Arrangement> {
    return getPrismaFromContext(ctx)
      .arrangementOfRoom.findUnique({
        where: {
          roomId_arrangementId: {
            roomId: arrangementOfRoom.roomId,
            arrangementId: arrangementOfRoom.arrangementId,
          },
        },
      })
      .arrangement({});
  }

  @TypeGraphQL.FieldResolver((_type) => Room, {
    nullable: false,
  })
  async room(
    @TypeGraphQL.Root() arrangementOfRoom: ArrangementOfRoom,
    @TypeGraphQL.Ctx() ctx: any
  ): Promise<Room> {
    return getPrismaFromContext(ctx)
      .arrangementOfRoom.findUnique({
        where: {
          roomId_arrangementId: {
            roomId: arrangementOfRoom.roomId,
            arrangementId: arrangementOfRoom.arrangementId,
          },
        },
      })
      .room({});
  }
}
