import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { AggregateSubuserOnAccountArgs } from './args/AggregateSubuserOnAccountArgs';
import { CreateManySubuserOnAccountArgs } from './args/CreateManySubuserOnAccountArgs';
import { CreateSubuserOnAccountArgs } from './args/CreateSubuserOnAccountArgs';
import { DeleteManySubuserOnAccountArgs } from './args/DeleteManySubuserOnAccountArgs';
import { DeleteSubuserOnAccountArgs } from './args/DeleteSubuserOnAccountArgs';
import { FindFirstSubuserOnAccountArgs } from './args/FindFirstSubuserOnAccountArgs';
import { FindManySubuserOnAccountArgs } from './args/FindManySubuserOnAccountArgs';
import { FindUniqueSubuserOnAccountArgs } from './args/FindUniqueSubuserOnAccountArgs';
import { GroupBySubuserOnAccountArgs } from './args/GroupBySubuserOnAccountArgs';
import { UpdateManySubuserOnAccountArgs } from './args/UpdateManySubuserOnAccountArgs';
import { UpdateSubuserOnAccountArgs } from './args/UpdateSubuserOnAccountArgs';
import { UpsertSubuserOnAccountArgs } from './args/UpsertSubuserOnAccountArgs';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';
import { SubuserOnAccount } from '../../../models/SubuserOnAccount';
import { AffectedRowsOutput } from '../../outputs/AffectedRowsOutput';
import { AggregateSubuserOnAccount } from '../../outputs/AggregateSubuserOnAccount';
import { SubuserOnAccountGroupBy } from '../../outputs/SubuserOnAccountGroupBy';

@TypeGraphQL.Resolver((_of) => SubuserOnAccount)
export class SubuserOnAccountCrudResolver {
  @TypeGraphQL.Query((_returns) => SubuserOnAccount, {
    nullable: true,
  })
  async subuserOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindUniqueSubuserOnAccountArgs
  ): Promise<SubuserOnAccount | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).subuserOnAccount.findUnique({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query((_returns) => SubuserOnAccount, {
    nullable: true,
  })
  async findFirstSubuserOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindFirstSubuserOnAccountArgs
  ): Promise<SubuserOnAccount | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).subuserOnAccount.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query((_returns) => [SubuserOnAccount], {
    nullable: false,
  })
  async subuserOnAccounts(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindManySubuserOnAccountArgs
  ): Promise<SubuserOnAccount[]> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).subuserOnAccount.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => SubuserOnAccount, {
    nullable: false,
  })
  async createSubuserOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: CreateSubuserOnAccountArgs
  ): Promise<SubuserOnAccount> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).subuserOnAccount.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => AffectedRowsOutput, {
    nullable: false,
  })
  async createManySubuserOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: CreateManySubuserOnAccountArgs
  ): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).subuserOnAccount.createMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => SubuserOnAccount, {
    nullable: true,
  })
  async deleteSubuserOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: DeleteSubuserOnAccountArgs
  ): Promise<SubuserOnAccount | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).subuserOnAccount.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => SubuserOnAccount, {
    nullable: true,
  })
  async updateSubuserOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpdateSubuserOnAccountArgs
  ): Promise<SubuserOnAccount | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).subuserOnAccount.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => AffectedRowsOutput, {
    nullable: false,
  })
  async deleteManySubuserOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: DeleteManySubuserOnAccountArgs
  ): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).subuserOnAccount.deleteMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => AffectedRowsOutput, {
    nullable: false,
  })
  async updateManySubuserOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpdateManySubuserOnAccountArgs
  ): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).subuserOnAccount.updateMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => SubuserOnAccount, {
    nullable: false,
  })
  async upsertSubuserOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpsertSubuserOnAccountArgs
  ): Promise<SubuserOnAccount> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).subuserOnAccount.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

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

  @TypeGraphQL.Query((_returns) => [SubuserOnAccountGroupBy], {
    nullable: false,
  })
  async groupBySubuserOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: GroupBySubuserOnAccountArgs
  ): Promise<SubuserOnAccountGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).subuserOnAccount.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(
          ([_, v]) => v != null
        )
      ),
    });
  }
}
