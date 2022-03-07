import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { CreateRoomArgs } from './args/CreateRoomArgs';
import { Room } from '../../../models/Room';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => Room)
export class CreateRoomResolver {
  @TypeGraphQL.Mutation((_returns) => Room, {
    nullable: false,
  })
  async createRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: CreateRoomArgs
  ): Promise<Room> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).room.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
