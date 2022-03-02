import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { UpsertApplicationArgs } from './args/UpsertApplicationArgs';
import { Application } from '../../../models/Application';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => Application)
export class UpsertApplicationResolver {
  @TypeGraphQL.Mutation((_returns) => Application, {
    nullable: false,
  })
  async upsertApplication(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpsertApplicationArgs
  ): Promise<Application> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).application.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
