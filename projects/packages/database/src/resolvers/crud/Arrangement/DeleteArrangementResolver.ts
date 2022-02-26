import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { DeleteArrangementArgs } from './args/DeleteArrangementArgs';
import { Arrangement } from '../../../models/Arrangement';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => Arrangement)
export class DeleteArrangementResolver {
  @TypeGraphQL.Mutation((_returns) => Arrangement, {
    nullable: true,
  })
  async deleteArrangement(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: DeleteArrangementArgs
  ): Promise<Arrangement | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).arrangement.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
