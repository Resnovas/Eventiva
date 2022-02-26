import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { AggregateArrangementOfRoomArgs } from './args/AggregateArrangementOfRoomArgs';
import { ArrangementOfRoom } from '../../../models/ArrangementOfRoom';
import { AggregateArrangementOfRoom } from '../../outputs/AggregateArrangementOfRoom';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => ArrangementOfRoom)
export class AggregateArrangementOfRoomResolver {
  @TypeGraphQL.Query((_returns) => AggregateArrangementOfRoom, {
    nullable: false,
  })
  async aggregateArrangementOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: AggregateArrangementOfRoomArgs
  ): Promise<AggregateArrangementOfRoom> {
    return getPrismaFromContext(ctx).arrangementOfRoom.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
