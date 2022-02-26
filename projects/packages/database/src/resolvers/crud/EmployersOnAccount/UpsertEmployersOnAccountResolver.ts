import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { UpsertEmployersOnAccountArgs } from './args/UpsertEmployersOnAccountArgs';
import { EmployersOnAccount } from '../../../models/EmployersOnAccount';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => EmployersOnAccount)
export class UpsertEmployersOnAccountResolver {
  @TypeGraphQL.Mutation((_returns) => EmployersOnAccount, {
    nullable: false,
  })
  async upsertEmployersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpsertEmployersOnAccountArgs
  ): Promise<EmployersOnAccount> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).employersOnAccount.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
