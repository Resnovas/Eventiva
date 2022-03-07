import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { AggregateRTWArgs } from './args/AggregateRTWArgs';
import { RTW } from '../../../models/RTW';
import { AggregateRTW } from '../../outputs/AggregateRTW';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => RTW)
export class AggregateRTWResolver {
  @TypeGraphQL.Query((_returns) => AggregateRTW, {
    nullable: false,
  })
  async aggregateRTW(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: AggregateRTWArgs
  ): Promise<AggregateRTW> {
    return getPrismaFromContext(ctx).rTW.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
