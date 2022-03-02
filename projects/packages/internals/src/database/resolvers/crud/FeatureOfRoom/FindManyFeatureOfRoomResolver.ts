import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { FindManyFeatureOfRoomArgs } from './args/FindManyFeatureOfRoomArgs';
import { FeatureOfRoom } from '../../../models/FeatureOfRoom';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => FeatureOfRoom)
export class FindManyFeatureOfRoomResolver {
  @TypeGraphQL.Query((_returns) => [FeatureOfRoom], {
    nullable: false,
  })
  async featureOfRooms(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindManyFeatureOfRoomArgs
  ): Promise<FeatureOfRoom[]> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfRoom.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
