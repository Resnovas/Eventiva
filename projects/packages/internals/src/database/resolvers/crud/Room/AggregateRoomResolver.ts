import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { AggregateRoomArgs } from './args/AggregateRoomArgs';
import { Room } from '../../../models/Room';
import { AggregateRoom } from '../../outputs/AggregateRoom';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => Room)
export class AggregateRoomResolver {
  @TypeGraphQL.Query((_returns) => AggregateRoom, {
    nullable: false,
  })
  async aggregateRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: AggregateRoomArgs
  ): Promise<AggregateRoom> {
    return getPrismaFromContext(ctx).room.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
