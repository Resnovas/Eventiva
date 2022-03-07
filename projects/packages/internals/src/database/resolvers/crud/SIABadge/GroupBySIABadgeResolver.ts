import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { GroupBySIABadgeArgs } from './args/GroupBySIABadgeArgs';
import { SIABadge } from '../../../models/SIABadge';
import { SIABadgeGroupBy } from '../../outputs/SIABadgeGroupBy';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => SIABadge)
export class GroupBySIABadgeResolver {
  @TypeGraphQL.Query((_returns) => [SIABadgeGroupBy], {
    nullable: false,
  })
  async groupBySIABadge(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: GroupBySIABadgeArgs
  ): Promise<SIABadgeGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).sIABadge.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(
          ([_, v]) => v != null
        )
      ),
    });
  }
}
