import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { AggregateEmployersOnAccountArgs } from './args/AggregateEmployersOnAccountArgs';
import { EmployersOnAccount } from '../../../models/EmployersOnAccount';
import { AggregateEmployersOnAccount } from '../../outputs/AggregateEmployersOnAccount';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => EmployersOnAccount)
export class AggregateEmployersOnAccountResolver {
  @TypeGraphQL.Query((_returns) => AggregateEmployersOnAccount, {
    nullable: false,
  })
  async aggregateEmployersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: AggregateEmployersOnAccountArgs
  ): Promise<AggregateEmployersOnAccount> {
    return getPrismaFromContext(ctx).employersOnAccount.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
