import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { UpsertFeatureOfRoomArgs } from './args/UpsertFeatureOfRoomArgs';
import { FeatureOfRoom } from '../../../models/FeatureOfRoom';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => FeatureOfRoom)
export class UpsertFeatureOfRoomResolver {
  @TypeGraphQL.Mutation((_returns) => FeatureOfRoom, {
    nullable: false,
  })
  async upsertFeatureOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpsertFeatureOfRoomArgs
  ): Promise<FeatureOfRoom> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfRoom.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
