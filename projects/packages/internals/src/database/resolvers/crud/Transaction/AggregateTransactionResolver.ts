import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { AggregateTransactionArgs } from './args/AggregateTransactionArgs';
import { Transaction } from '../../../models/Transaction';
import { AggregateTransaction } from '../../outputs/AggregateTransaction';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => Transaction)
export class AggregateTransactionResolver {
  @TypeGraphQL.Query((_returns) => AggregateTransaction, {
    nullable: false,
  })
  async aggregateTransaction(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: AggregateTransactionArgs
  ): Promise<AggregateTransaction> {
    return getPrismaFromContext(ctx).transaction.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
