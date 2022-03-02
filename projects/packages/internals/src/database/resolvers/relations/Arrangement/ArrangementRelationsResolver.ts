import * as TypeGraphQL from 'type-graphql';
import { Arrangement } from '../../../models/Arrangement';
import { ArrangementOfRoom } from '../../../models/ArrangementOfRoom';
import { ArrangementRoomArgs } from './args/ArrangementRoomArgs';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => Arrangement)
export class ArrangementRelationsResolver {
  @TypeGraphQL.FieldResolver((_type) => [ArrangementOfRoom], {
    nullable: false,
  })
  async room(
    @TypeGraphQL.Root() arrangement: Arrangement,
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Args() args: ArrangementRoomArgs
  ): Promise<ArrangementOfRoom[]> {
    return getPrismaFromContext(ctx)
      .arrangement.findUnique({
        where: {
          id: arrangement.id,
        },
      })
      .room(args);
  }
}
