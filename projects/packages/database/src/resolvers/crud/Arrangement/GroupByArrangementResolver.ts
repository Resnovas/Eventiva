import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { GroupByArrangementArgs } from './args/GroupByArrangementArgs';
import { Arrangement } from '../../../models/Arrangement';
import { ArrangementGroupBy } from '../../outputs/ArrangementGroupBy';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => Arrangement)
export class GroupByArrangementResolver {
  @TypeGraphQL.Query((_returns) => [ArrangementGroupBy], {
    nullable: false,
  })
  async groupByArrangement(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: GroupByArrangementArgs
  ): Promise<ArrangementGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).arrangement.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(
          ([_, v]) => v != null
        )
      ),
    });
  }
}
