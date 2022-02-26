import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { FindManyArrangementOfRoomArgs } from './args/FindManyArrangementOfRoomArgs';
import { ArrangementOfRoom } from '../../../models/ArrangementOfRoom';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => ArrangementOfRoom)
export class FindManyArrangementOfRoomResolver {
  @TypeGraphQL.Query((_returns) => [ArrangementOfRoom], {
    nullable: false,
  })
  async arrangementOfRooms(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindManyArrangementOfRoomArgs
  ): Promise<ArrangementOfRoom[]> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).arrangementOfRoom.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
