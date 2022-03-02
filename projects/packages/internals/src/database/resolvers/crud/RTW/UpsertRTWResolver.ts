import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { UpsertRTWArgs } from './args/UpsertRTWArgs';
import { RTW } from '../../../models/RTW';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => RTW)
export class UpsertRTWResolver {
  @TypeGraphQL.Mutation((_returns) => RTW, {
    nullable: false,
  })
  async upsertRTW(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpsertRTWArgs
  ): Promise<RTW> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).rTW.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
