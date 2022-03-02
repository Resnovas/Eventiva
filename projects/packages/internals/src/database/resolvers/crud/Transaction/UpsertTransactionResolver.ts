import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { UpsertTransactionArgs } from './args/UpsertTransactionArgs';
import { Transaction } from '../../../models/Transaction';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => Transaction)
export class UpsertTransactionResolver {
  @TypeGraphQL.Mutation((_returns) => Transaction, {
    nullable: false,
  })
  async upsertTransaction(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpsertTransactionArgs
  ): Promise<Transaction> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).transaction.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
