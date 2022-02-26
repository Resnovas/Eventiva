import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { GroupBySIACheckArgs } from './args/GroupBySIACheckArgs';
import { SIACheck } from '../../../models/SIACheck';
import { SIACheckGroupBy } from '../../outputs/SIACheckGroupBy';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => SIACheck)
export class GroupBySIACheckResolver {
  @TypeGraphQL.Query((_returns) => [SIACheckGroupBy], {
    nullable: false,
  })
  async groupBySIACheck(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: GroupBySIACheckArgs
  ): Promise<SIACheckGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).sIACheck.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(
          ([_, v]) => v != null
        )
      ),
    });
  }
}
