import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { DeleteSIABadgeArgs } from './args/DeleteSIABadgeArgs';
import { SIABadge } from '../../../models/SIABadge';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => SIABadge)
export class DeleteSIABadgeResolver {
  @TypeGraphQL.Mutation((_returns) => SIABadge, {
    nullable: true,
  })
  async deleteSIABadge(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: DeleteSIABadgeArgs
  ): Promise<SIABadge | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).sIABadge.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
