import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { UpsertSubuserOnAccountArgs } from './args/UpsertSubuserOnAccountArgs';
import { SubuserOnAccount } from '../../../models/SubuserOnAccount';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => SubuserOnAccount)
export class UpsertSubuserOnAccountResolver {
  @TypeGraphQL.Mutation((_returns) => SubuserOnAccount, {
    nullable: false,
  })
  async upsertSubuserOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpsertSubuserOnAccountArgs
  ): Promise<SubuserOnAccount> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).subuserOnAccount.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
