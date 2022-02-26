import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { AggregateManagersOnAccountArgs } from './args/AggregateManagersOnAccountArgs';
import { CreateManagersOnAccountArgs } from './args/CreateManagersOnAccountArgs';
import { CreateManyManagersOnAccountArgs } from './args/CreateManyManagersOnAccountArgs';
import { DeleteManagersOnAccountArgs } from './args/DeleteManagersOnAccountArgs';
import { DeleteManyManagersOnAccountArgs } from './args/DeleteManyManagersOnAccountArgs';
import { FindFirstManagersOnAccountArgs } from './args/FindFirstManagersOnAccountArgs';
import { FindManyManagersOnAccountArgs } from './args/FindManyManagersOnAccountArgs';
import { FindUniqueManagersOnAccountArgs } from './args/FindUniqueManagersOnAccountArgs';
import { GroupByManagersOnAccountArgs } from './args/GroupByManagersOnAccountArgs';
import { UpdateManagersOnAccountArgs } from './args/UpdateManagersOnAccountArgs';
import { UpdateManyManagersOnAccountArgs } from './args/UpdateManyManagersOnAccountArgs';
import { UpsertManagersOnAccountArgs } from './args/UpsertManagersOnAccountArgs';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';
import { ManagersOnAccount } from '../../../models/ManagersOnAccount';
import { AffectedRowsOutput } from '../../outputs/AffectedRowsOutput';
import { AggregateManagersOnAccount } from '../../outputs/AggregateManagersOnAccount';
import { ManagersOnAccountGroupBy } from '../../outputs/ManagersOnAccountGroupBy';

@TypeGraphQL.Resolver((_of) => ManagersOnAccount)
export class ManagersOnAccountCrudResolver {
  @TypeGraphQL.Query((_returns) => ManagersOnAccount, {
    nullable: true,
  })
  async managersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindUniqueManagersOnAccountArgs
  ): Promise<ManagersOnAccount | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).managersOnAccount.findUnique({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query((_returns) => ManagersOnAccount, {
    nullable: true,
  })
  async findFirstManagersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindFirstManagersOnAccountArgs
  ): Promise<ManagersOnAccount | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).managersOnAccount.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query((_returns) => [ManagersOnAccount], {
    nullable: false,
  })
  async managersOnAccounts(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindManyManagersOnAccountArgs
  ): Promise<ManagersOnAccount[]> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).managersOnAccount.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => ManagersOnAccount, {
    nullable: false,
  })
  async createManagersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: CreateManagersOnAccountArgs
  ): Promise<ManagersOnAccount> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).managersOnAccount.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => AffectedRowsOutput, {
    nullable: false,
  })
  async createManyManagersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: CreateManyManagersOnAccountArgs
  ): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).managersOnAccount.createMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => ManagersOnAccount, {
    nullable: true,
  })
  async deleteManagersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: DeleteManagersOnAccountArgs
  ): Promise<ManagersOnAccount | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).managersOnAccount.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => ManagersOnAccount, {
    nullable: true,
  })
  async updateManagersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpdateManagersOnAccountArgs
  ): Promise<ManagersOnAccount | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).managersOnAccount.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => AffectedRowsOutput, {
    nullable: false,
  })
  async deleteManyManagersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: DeleteManyManagersOnAccountArgs
  ): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).managersOnAccount.deleteMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => AffectedRowsOutput, {
    nullable: false,
  })
  async updateManyManagersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpdateManyManagersOnAccountArgs
  ): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).managersOnAccount.updateMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => ManagersOnAccount, {
    nullable: false,
  })
  async upsertManagersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpsertManagersOnAccountArgs
  ): Promise<ManagersOnAccount> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).managersOnAccount.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query((_returns) => AggregateManagersOnAccount, {
    nullable: false,
  })
  async aggregateManagersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: AggregateManagersOnAccountArgs
  ): Promise<AggregateManagersOnAccount> {
    return getPrismaFromContext(ctx).managersOnAccount.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }

  @TypeGraphQL.Query((_returns) => [ManagersOnAccountGroupBy], {
    nullable: false,
  })
  async groupByManagersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: GroupByManagersOnAccountArgs
  ): Promise<ManagersOnAccountGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).managersOnAccount.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(
          ([_, v]) => v != null
        )
      ),
    });
  }
}
