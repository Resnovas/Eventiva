import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { UpsertVenueStyleArgs } from './args/UpsertVenueStyleArgs';
import { VenueStyle } from '../../../models/VenueStyle';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => VenueStyle)
export class UpsertVenueStyleResolver {
  @TypeGraphQL.Mutation((_returns) => VenueStyle, {
    nullable: false,
  })
  async upsertVenueStyle(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpsertVenueStyleArgs
  ): Promise<VenueStyle> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).venueStyle.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
