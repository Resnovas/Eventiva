import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { AggregateFilesArgs } from './args/AggregateFilesArgs';
import { Files } from '../../../models/Files';
import { AggregateFiles } from '../../outputs/AggregateFiles';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => Files)
export class AggregateFilesResolver {
  @TypeGraphQL.Query((_returns) => AggregateFiles, {
    nullable: false,
  })
  async aggregateFiles(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: AggregateFilesArgs
  ): Promise<AggregateFiles> {
    return getPrismaFromContext(ctx).files.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
