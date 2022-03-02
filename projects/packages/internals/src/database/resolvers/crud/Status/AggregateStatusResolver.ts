import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { AggregateStatusArgs } from './args/AggregateStatusArgs';
import { Status } from '../../../models/Status';
import { AggregateStatus } from '../../outputs/AggregateStatus';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => Status)
export class AggregateStatusResolver {
  @TypeGraphQL.Query((_returns) => AggregateStatus, {
    nullable: false,
  })
  async aggregateStatus(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: AggregateStatusArgs
  ): Promise<AggregateStatus> {
    return getPrismaFromContext(ctx).status.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
