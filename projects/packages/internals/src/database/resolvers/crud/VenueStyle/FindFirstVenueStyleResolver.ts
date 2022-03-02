import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { FindFirstVenueStyleArgs } from './args/FindFirstVenueStyleArgs';
import { VenueStyle } from '../../../models/VenueStyle';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => VenueStyle)
export class FindFirstVenueStyleResolver {
  @TypeGraphQL.Query((_returns) => VenueStyle, {
    nullable: true,
  })
  async findFirstVenueStyle(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindFirstVenueStyleArgs
  ): Promise<VenueStyle | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).venueStyle.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
