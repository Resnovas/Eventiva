import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { AggregateSIACheckArgs } from './args/AggregateSIACheckArgs';
import { CreateManySIACheckArgs } from './args/CreateManySIACheckArgs';
import { CreateSIACheckArgs } from './args/CreateSIACheckArgs';
import { DeleteManySIACheckArgs } from './args/DeleteManySIACheckArgs';
import { DeleteSIACheckArgs } from './args/DeleteSIACheckArgs';
import { FindFirstSIACheckArgs } from './args/FindFirstSIACheckArgs';
import { FindManySIACheckArgs } from './args/FindManySIACheckArgs';
import { FindUniqueSIACheckArgs } from './args/FindUniqueSIACheckArgs';
import { GroupBySIACheckArgs } from './args/GroupBySIACheckArgs';
import { UpdateManySIACheckArgs } from './args/UpdateManySIACheckArgs';
import { UpdateSIACheckArgs } from './args/UpdateSIACheckArgs';
import { UpsertSIACheckArgs } from './args/UpsertSIACheckArgs';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';
import { SIACheck } from '../../../models/SIACheck';
import { AffectedRowsOutput } from '../../outputs/AffectedRowsOutput';
import { AggregateSIACheck } from '../../outputs/AggregateSIACheck';
import { SIACheckGroupBy } from '../../outputs/SIACheckGroupBy';

@TypeGraphQL.Resolver((_of) => SIACheck)
export class SIACheckCrudResolver {
  @TypeGraphQL.Query((_returns) => SIACheck, {
    nullable: true,
  })
  async sIACheck(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindUniqueSIACheckArgs
  ): Promise<SIACheck | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).sIACheck.findUnique({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query((_returns) => SIACheck, {
    nullable: true,
  })
  async findFirstSIACheck(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindFirstSIACheckArgs
  ): Promise<SIACheck | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).sIACheck.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query((_returns) => [SIACheck], {
    nullable: false,
  })
  async sIAChecks(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindManySIACheckArgs
  ): Promise<SIACheck[]> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).sIACheck.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

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

  @TypeGraphQL.Mutation((_returns) => AffectedRowsOutput, {
    nullable: false,
  })
  async createManySIACheck(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: CreateManySIACheckArgs
  ): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).sIACheck.createMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => SIACheck, {
    nullable: true,
  })
  async deleteSIACheck(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: DeleteSIACheckArgs
  ): Promise<SIACheck | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).sIACheck.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => SIACheck, {
    nullable: true,
  })
  async updateSIACheck(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpdateSIACheckArgs
  ): Promise<SIACheck | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).sIACheck.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => AffectedRowsOutput, {
    nullable: false,
  })
  async deleteManySIACheck(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: DeleteManySIACheckArgs
  ): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).sIACheck.deleteMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => AffectedRowsOutput, {
    nullable: false,
  })
  async updateManySIACheck(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpdateManySIACheckArgs
  ): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).sIACheck.updateMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => SIACheck, {
    nullable: false,
  })
  async upsertSIACheck(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpsertSIACheckArgs
  ): Promise<SIACheck> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).sIACheck.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query((_returns) => AggregateSIACheck, {
    nullable: false,
  })
  async aggregateSIACheck(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: AggregateSIACheckArgs
  ): Promise<AggregateSIACheck> {
    return getPrismaFromContext(ctx).sIACheck.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }

  @TypeGraphQL.Query((_returns) => [SIACheckGroupBy], {
    nullable: false,
  })
  async groupBySIACheck(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: GroupBySIACheckArgs
  ): Promise<SIACheckGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).sIACheck.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(
          ([_, v]) => v != null
        )
      ),
    });
  }
}
