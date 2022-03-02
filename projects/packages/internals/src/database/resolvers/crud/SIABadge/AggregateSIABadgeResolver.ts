import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { AggregateSIABadgeArgs } from './args/AggregateSIABadgeArgs';
import { SIABadge } from '../../../models/SIABadge';
import { AggregateSIABadge } from '../../outputs/AggregateSIABadge';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => SIABadge)
export class AggregateSIABadgeResolver {
  @TypeGraphQL.Query((_returns) => AggregateSIABadge, {
    nullable: false,
  })
  async aggregateSIABadge(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: AggregateSIABadgeArgs
  ): Promise<AggregateSIABadge> {
    return getPrismaFromContext(ctx).sIABadge.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
