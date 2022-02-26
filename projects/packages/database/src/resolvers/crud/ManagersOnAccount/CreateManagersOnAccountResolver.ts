import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { CreateManagersOnAccountArgs } from './args/CreateManagersOnAccountArgs';
import { ManagersOnAccount } from '../../../models/ManagersOnAccount';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => ManagersOnAccount)
export class CreateManagersOnAccountResolver {
  @TypeGraphQL.Mutation((_returns) => ManagersOnAccount, {
    nullable: false,
  })
  async createManagersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: CreateManagersOnAccountArgs
  ): Promise<ManagersOnAccount> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).managersOnAccount.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
