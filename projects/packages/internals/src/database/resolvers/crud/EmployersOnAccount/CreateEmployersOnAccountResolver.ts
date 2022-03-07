import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { CreateEmployersOnAccountArgs } from './args/CreateEmployersOnAccountArgs';
import { EmployersOnAccount } from '../../../models/EmployersOnAccount';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => EmployersOnAccount)
export class CreateEmployersOnAccountResolver {
  @TypeGraphQL.Mutation((_returns) => EmployersOnAccount, {
    nullable: false,
  })
  async createEmployersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: CreateEmployersOnAccountArgs
  ): Promise<EmployersOnAccount> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).employersOnAccount.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
