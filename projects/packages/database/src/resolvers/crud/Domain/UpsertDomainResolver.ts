import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { UpsertDomainArgs } from './args/UpsertDomainArgs';
import { Domain } from '../../../models/Domain';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => Domain)
export class UpsertDomainResolver {
  @TypeGraphQL.Mutation((_returns) => Domain, {
    nullable: false,
  })
  async upsertDomain(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpsertDomainArgs
  ): Promise<Domain> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).domain.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
