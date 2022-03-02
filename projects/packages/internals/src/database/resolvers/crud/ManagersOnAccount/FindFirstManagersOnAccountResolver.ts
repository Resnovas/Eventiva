import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { FindFirstManagersOnAccountArgs } from './args/FindFirstManagersOnAccountArgs';
import { ManagersOnAccount } from '../../../models/ManagersOnAccount';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => ManagersOnAccount)
export class FindFirstManagersOnAccountResolver {
  @TypeGraphQL.Query((_returns) => ManagersOnAccount, {
    nullable: true,
  })
  async findFirstManagersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindFirstManagersOnAccountArgs
  ): Promise<ManagersOnAccount | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).managersOnAccount.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
