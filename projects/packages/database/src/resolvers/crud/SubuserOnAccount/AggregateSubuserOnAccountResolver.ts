import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { AggregateSubuserOnAccountArgs } from './args/AggregateSubuserOnAccountArgs';
import { SubuserOnAccount } from '../../../models/SubuserOnAccount';
import { AggregateSubuserOnAccount } from '../../outputs/AggregateSubuserOnAccount';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => SubuserOnAccount)
export class AggregateSubuserOnAccountResolver {
  @TypeGraphQL.Query((_returns) => AggregateSubuserOnAccount, {
    nullable: false,
  })
  async aggregateSubuserOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: AggregateSubuserOnAccountArgs
  ): Promise<AggregateSubuserOnAccount> {
    return getPrismaFromContext(ctx).subuserOnAccount.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
