import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { AggregateEmailArgs } from './args/AggregateEmailArgs';
import { Email } from '../../../models/Email';
import { AggregateEmail } from '../../outputs/AggregateEmail';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => Email)
export class AggregateEmailResolver {
  @TypeGraphQL.Query((_returns) => AggregateEmail, {
    nullable: false,
  })
  async aggregateEmail(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: AggregateEmailArgs
  ): Promise<AggregateEmail> {
    return getPrismaFromContext(ctx).email.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
