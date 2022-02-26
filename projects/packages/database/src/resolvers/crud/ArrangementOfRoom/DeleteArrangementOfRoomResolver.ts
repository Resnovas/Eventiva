import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { DeleteArrangementOfRoomArgs } from './args/DeleteArrangementOfRoomArgs';
import { ArrangementOfRoom } from '../../../models/ArrangementOfRoom';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => ArrangementOfRoom)
export class DeleteArrangementOfRoomResolver {
  @TypeGraphQL.Mutation((_returns) => ArrangementOfRoom, {
    nullable: true,
  })
  async deleteArrangementOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: DeleteArrangementOfRoomArgs
  ): Promise<ArrangementOfRoom | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).arrangementOfRoom.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
