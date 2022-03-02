import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { UpdateArrangementOfRoomArgs } from './args/UpdateArrangementOfRoomArgs';
import { ArrangementOfRoom } from '../../../models/ArrangementOfRoom';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => ArrangementOfRoom)
export class UpdateArrangementOfRoomResolver {
  @TypeGraphQL.Mutation((_returns) => ArrangementOfRoom, {
    nullable: true,
  })
  async updateArrangementOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpdateArrangementOfRoomArgs
  ): Promise<ArrangementOfRoom | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).arrangementOfRoom.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
