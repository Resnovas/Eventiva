import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { GroupByVenueStyleArgs } from './args/GroupByVenueStyleArgs';
import { VenueStyle } from '../../../models/VenueStyle';
import { VenueStyleGroupBy } from '../../outputs/VenueStyleGroupBy';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => VenueStyle)
export class GroupByVenueStyleResolver {
  @TypeGraphQL.Query((_returns) => [VenueStyleGroupBy], {
    nullable: false,
  })
  async groupByVenueStyle(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: GroupByVenueStyleArgs
  ): Promise<VenueStyleGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).venueStyle.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(
          ([_, v]) => v != null
        )
      ),
    });
  }
}
