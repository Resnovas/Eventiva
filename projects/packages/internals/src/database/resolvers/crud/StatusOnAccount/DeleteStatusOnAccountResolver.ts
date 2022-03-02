import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { DeleteStatusOnAccountArgs } from './args/DeleteStatusOnAccountArgs';
import { StatusOnAccount } from '../../../models/StatusOnAccount';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => StatusOnAccount)
export class DeleteStatusOnAccountResolver {
  @TypeGraphQL.Mutation((_returns) => StatusOnAccount, {
    nullable: true,
  })
  async deleteStatusOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: DeleteStatusOnAccountArgs
  ): Promise<StatusOnAccount | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).statusOnAccount.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
