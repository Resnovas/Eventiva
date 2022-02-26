import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { UpsertStatusOnAccountArgs } from './args/UpsertStatusOnAccountArgs';
import { StatusOnAccount } from '../../../models/StatusOnAccount';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => StatusOnAccount)
export class UpsertStatusOnAccountResolver {
  @TypeGraphQL.Mutation((_returns) => StatusOnAccount, {
    nullable: false,
  })
  async upsertStatusOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpsertStatusOnAccountArgs
  ): Promise<StatusOnAccount> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).statusOnAccount.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
