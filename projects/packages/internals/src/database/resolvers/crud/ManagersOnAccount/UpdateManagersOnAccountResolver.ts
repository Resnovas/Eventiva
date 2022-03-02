import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { UpdateManagersOnAccountArgs } from './args/UpdateManagersOnAccountArgs';
import { ManagersOnAccount } from '../../../models/ManagersOnAccount';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => ManagersOnAccount)
export class UpdateManagersOnAccountResolver {
  @TypeGraphQL.Mutation((_returns) => ManagersOnAccount, {
    nullable: true,
  })
  async updateManagersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpdateManagersOnAccountArgs
  ): Promise<ManagersOnAccount | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).managersOnAccount.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
