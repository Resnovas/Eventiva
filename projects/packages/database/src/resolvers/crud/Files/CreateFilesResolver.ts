import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { CreateFilesArgs } from './args/CreateFilesArgs';
import { Files } from '../../../models/Files';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => Files)
export class CreateFilesResolver {
  @TypeGraphQL.Mutation((_returns) => Files, {
    nullable: false,
  })
  async createFiles(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: CreateFilesArgs
  ): Promise<Files> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).files.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
