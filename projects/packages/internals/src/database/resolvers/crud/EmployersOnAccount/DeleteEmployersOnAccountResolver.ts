import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { DeleteEmployersOnAccountArgs } from './args/DeleteEmployersOnAccountArgs';
import { EmployersOnAccount } from '../../../models/EmployersOnAccount';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => EmployersOnAccount)
export class DeleteEmployersOnAccountResolver {
  @TypeGraphQL.Mutation((_returns) => EmployersOnAccount, {
    nullable: true,
  })
  async deleteEmployersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: DeleteEmployersOnAccountArgs
  ): Promise<EmployersOnAccount | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).employersOnAccount.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
