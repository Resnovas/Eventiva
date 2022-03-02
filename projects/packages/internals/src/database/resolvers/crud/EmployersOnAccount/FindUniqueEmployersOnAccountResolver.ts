import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { FindUniqueEmployersOnAccountArgs } from './args/FindUniqueEmployersOnAccountArgs';
import { EmployersOnAccount } from '../../../models/EmployersOnAccount';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => EmployersOnAccount)
export class FindUniqueEmployersOnAccountResolver {
  @TypeGraphQL.Query((_returns) => EmployersOnAccount, {
    nullable: true,
  })
  async employersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindUniqueEmployersOnAccountArgs
  ): Promise<EmployersOnAccount | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).employersOnAccount.findUnique({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
