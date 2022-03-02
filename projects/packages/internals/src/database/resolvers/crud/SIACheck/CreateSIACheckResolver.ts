import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { CreateSIACheckArgs } from './args/CreateSIACheckArgs';
import { SIACheck } from '../../../models/SIACheck';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => SIACheck)
export class CreateSIACheckResolver {
  @TypeGraphQL.Mutation((_returns) => SIACheck, {
    nullable: false,
  })
  async createSIACheck(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: CreateSIACheckArgs
  ): Promise<SIACheck> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).sIACheck.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
