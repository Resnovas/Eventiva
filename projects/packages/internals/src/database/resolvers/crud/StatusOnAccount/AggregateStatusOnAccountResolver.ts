import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { AggregateStatusOnAccountArgs } from './args/AggregateStatusOnAccountArgs';
import { StatusOnAccount } from '../../../models/StatusOnAccount';
import { AggregateStatusOnAccount } from '../../outputs/AggregateStatusOnAccount';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => StatusOnAccount)
export class AggregateStatusOnAccountResolver {
  @TypeGraphQL.Query((_returns) => AggregateStatusOnAccount, {
    nullable: false,
  })
  async aggregateStatusOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: AggregateStatusOnAccountArgs
  ): Promise<AggregateStatusOnAccount> {
    return getPrismaFromContext(ctx).statusOnAccount.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
