import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { DeleteFeatureOfRoomArgs } from './args/DeleteFeatureOfRoomArgs';
import { FeatureOfRoom } from '../../../models/FeatureOfRoom';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => FeatureOfRoom)
export class DeleteFeatureOfRoomResolver {
  @TypeGraphQL.Mutation((_returns) => FeatureOfRoom, {
    nullable: true,
  })
  async deleteFeatureOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: DeleteFeatureOfRoomArgs
  ): Promise<FeatureOfRoom | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfRoom.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
