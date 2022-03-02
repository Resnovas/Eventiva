import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { FindUniqueStatusOnAccountArgs } from './args/FindUniqueStatusOnAccountArgs';
import { StatusOnAccount } from '../../../models/StatusOnAccount';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => StatusOnAccount)
export class FindUniqueStatusOnAccountResolver {
  @TypeGraphQL.Query((_returns) => StatusOnAccount, {
    nullable: true,
  })
  async statusOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindUniqueStatusOnAccountArgs
  ): Promise<StatusOnAccount | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).statusOnAccount.findUnique({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
