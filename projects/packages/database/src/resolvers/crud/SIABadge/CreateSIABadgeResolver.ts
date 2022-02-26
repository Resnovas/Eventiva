import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { CreateSIABadgeArgs } from './args/CreateSIABadgeArgs';
import { SIABadge } from '../../../models/SIABadge';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => SIABadge)
export class CreateSIABadgeResolver {
  @TypeGraphQL.Mutation((_returns) => SIABadge, {
    nullable: false,
  })
  async createSIABadge(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: CreateSIABadgeArgs
  ): Promise<SIABadge> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).sIABadge.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
