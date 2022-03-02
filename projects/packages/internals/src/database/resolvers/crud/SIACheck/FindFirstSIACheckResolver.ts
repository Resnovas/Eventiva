import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { FindFirstSIACheckArgs } from './args/FindFirstSIACheckArgs';
import { SIACheck } from '../../../models/SIACheck';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => SIACheck)
export class FindFirstSIACheckResolver {
  @TypeGraphQL.Query((_returns) => SIACheck, {
    nullable: true,
  })
  async findFirstSIACheck(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindFirstSIACheckArgs
  ): Promise<SIACheck | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).sIACheck.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
