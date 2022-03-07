import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { UpdateSubuserOnAccountArgs } from './args/UpdateSubuserOnAccountArgs';
import { SubuserOnAccount } from '../../../models/SubuserOnAccount';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => SubuserOnAccount)
export class UpdateSubuserOnAccountResolver {
  @TypeGraphQL.Mutation((_returns) => SubuserOnAccount, {
    nullable: true,
  })
  async updateSubuserOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpdateSubuserOnAccountArgs
  ): Promise<SubuserOnAccount | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).subuserOnAccount.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
