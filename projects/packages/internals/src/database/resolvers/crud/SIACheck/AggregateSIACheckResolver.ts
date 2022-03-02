import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { AggregateSIACheckArgs } from './args/AggregateSIACheckArgs';
import { SIACheck } from '../../../models/SIACheck';
import { AggregateSIACheck } from '../../outputs/AggregateSIACheck';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => SIACheck)
export class AggregateSIACheckResolver {
  @TypeGraphQL.Query((_returns) => AggregateSIACheck, {
    nullable: false,
  })
  async aggregateSIACheck(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: AggregateSIACheckArgs
  ): Promise<AggregateSIACheck> {
    return getPrismaFromContext(ctx).sIACheck.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
