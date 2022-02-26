import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { FindFirstArrangementArgs } from './args/FindFirstArrangementArgs';
import { Arrangement } from '../../../models/Arrangement';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => Arrangement)
export class FindFirstArrangementResolver {
  @TypeGraphQL.Query((_returns) => Arrangement, {
    nullable: true,
  })
  async findFirstArrangement(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindFirstArrangementArgs
  ): Promise<Arrangement | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).arrangement.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
