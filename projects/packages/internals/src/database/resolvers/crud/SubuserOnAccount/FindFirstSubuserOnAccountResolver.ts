import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { FindFirstSubuserOnAccountArgs } from './args/FindFirstSubuserOnAccountArgs';
import { SubuserOnAccount } from '../../../models/SubuserOnAccount';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => SubuserOnAccount)
export class FindFirstSubuserOnAccountResolver {
  @TypeGraphQL.Query((_returns) => SubuserOnAccount, {
    nullable: true,
  })
  async findFirstSubuserOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindFirstSubuserOnAccountArgs
  ): Promise<SubuserOnAccount | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).subuserOnAccount.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
