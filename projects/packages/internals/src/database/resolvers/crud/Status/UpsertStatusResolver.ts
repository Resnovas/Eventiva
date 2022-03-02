import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { UpsertStatusArgs } from './args/UpsertStatusArgs';
import { Status } from '../../../models/Status';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => Status)
export class UpsertStatusResolver {
  @TypeGraphQL.Mutation((_returns) => Status, {
    nullable: false,
  })
  async upsertStatus(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpsertStatusArgs
  ): Promise<Status> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).status.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
