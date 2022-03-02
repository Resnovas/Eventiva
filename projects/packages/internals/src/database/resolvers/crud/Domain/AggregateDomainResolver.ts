import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { AggregateDomainArgs } from './args/AggregateDomainArgs';
import { Domain } from '../../../models/Domain';
import { AggregateDomain } from '../../outputs/AggregateDomain';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => Domain)
export class AggregateDomainResolver {
  @TypeGraphQL.Query((_returns) => AggregateDomain, {
    nullable: false,
  })
  async aggregateDomain(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: AggregateDomainArgs
  ): Promise<AggregateDomain> {
    return getPrismaFromContext(ctx).domain.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
