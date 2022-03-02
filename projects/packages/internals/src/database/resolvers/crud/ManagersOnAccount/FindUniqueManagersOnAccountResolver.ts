import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { FindUniqueManagersOnAccountArgs } from './args/FindUniqueManagersOnAccountArgs';
import { ManagersOnAccount } from '../../../models/ManagersOnAccount';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => ManagersOnAccount)
export class FindUniqueManagersOnAccountResolver {
  @TypeGraphQL.Query((_returns) => ManagersOnAccount, {
    nullable: true,
  })
  async managersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindUniqueManagersOnAccountArgs
  ): Promise<ManagersOnAccount | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).managersOnAccount.findUnique({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
