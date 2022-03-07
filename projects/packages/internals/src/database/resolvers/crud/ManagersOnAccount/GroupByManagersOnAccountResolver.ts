import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { GroupByManagersOnAccountArgs } from './args/GroupByManagersOnAccountArgs';
import { ManagersOnAccount } from '../../../models/ManagersOnAccount';
import { ManagersOnAccountGroupBy } from '../../outputs/ManagersOnAccountGroupBy';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => ManagersOnAccount)
export class GroupByManagersOnAccountResolver {
  @TypeGraphQL.Query((_returns) => [ManagersOnAccountGroupBy], {
    nullable: false,
  })
  async groupByManagersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: GroupByManagersOnAccountArgs
  ): Promise<ManagersOnAccountGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).managersOnAccount.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(
          ([_, v]) => v != null
        )
      ),
    });
  }
}
