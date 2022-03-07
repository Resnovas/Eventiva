import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { AggregateEmployersOnAccountArgs } from './args/AggregateEmployersOnAccountArgs';
import { CreateEmployersOnAccountArgs } from './args/CreateEmployersOnAccountArgs';
import { CreateManyEmployersOnAccountArgs } from './args/CreateManyEmployersOnAccountArgs';
import { DeleteEmployersOnAccountArgs } from './args/DeleteEmployersOnAccountArgs';
import { DeleteManyEmployersOnAccountArgs } from './args/DeleteManyEmployersOnAccountArgs';
import { FindFirstEmployersOnAccountArgs } from './args/FindFirstEmployersOnAccountArgs';
import { FindManyEmployersOnAccountArgs } from './args/FindManyEmployersOnAccountArgs';
import { FindUniqueEmployersOnAccountArgs } from './args/FindUniqueEmployersOnAccountArgs';
import { GroupByEmployersOnAccountArgs } from './args/GroupByEmployersOnAccountArgs';
import { UpdateEmployersOnAccountArgs } from './args/UpdateEmployersOnAccountArgs';
import { UpdateManyEmployersOnAccountArgs } from './args/UpdateManyEmployersOnAccountArgs';
import { UpsertEmployersOnAccountArgs } from './args/UpsertEmployersOnAccountArgs';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';
import { EmployersOnAccount } from '../../../models/EmployersOnAccount';
import { AffectedRowsOutput } from '../../outputs/AffectedRowsOutput';
import { AggregateEmployersOnAccount } from '../../outputs/AggregateEmployersOnAccount';
import { EmployersOnAccountGroupBy } from '../../outputs/EmployersOnAccountGroupBy';

@TypeGraphQL.Resolver((_of) => EmployersOnAccount)
export class EmployersOnAccountCrudResolver {
  @TypeGraphQL.Query((_returns) => EmployersOnAccount, {
    nullable: true,
  })
  async employersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindUniqueEmployersOnAccountArgs
  ): Promise<EmployersOnAccount | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).employersOnAccount.findUnique({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query((_returns) => EmployersOnAccount, {
    nullable: true,
  })
  async findFirstEmployersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindFirstEmployersOnAccountArgs
  ): Promise<EmployersOnAccount | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).employersOnAccount.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query((_returns) => [EmployersOnAccount], {
    nullable: false,
  })
  async employersOnAccounts(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindManyEmployersOnAccountArgs
  ): Promise<EmployersOnAccount[]> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).employersOnAccount.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => EmployersOnAccount, {
    nullable: false,
  })
  async createEmployersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: CreateEmployersOnAccountArgs
  ): Promise<EmployersOnAccount> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).employersOnAccount.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => AffectedRowsOutput, {
    nullable: false,
  })
  async createManyEmployersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: CreateManyEmployersOnAccountArgs
  ): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).employersOnAccount.createMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => EmployersOnAccount, {
    nullable: true,
  })
  async deleteEmployersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: DeleteEmployersOnAccountArgs
  ): Promise<EmployersOnAccount | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).employersOnAccount.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => EmployersOnAccount, {
    nullable: true,
  })
  async updateEmployersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpdateEmployersOnAccountArgs
  ): Promise<EmployersOnAccount | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).employersOnAccount.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => AffectedRowsOutput, {
    nullable: false,
  })
  async deleteManyEmployersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: DeleteManyEmployersOnAccountArgs
  ): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).employersOnAccount.deleteMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => AffectedRowsOutput, {
    nullable: false,
  })
  async updateManyEmployersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpdateManyEmployersOnAccountArgs
  ): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).employersOnAccount.updateMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => EmployersOnAccount, {
    nullable: false,
  })
  async upsertEmployersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpsertEmployersOnAccountArgs
  ): Promise<EmployersOnAccount> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).employersOnAccount.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query((_returns) => AggregateEmployersOnAccount, {
    nullable: false,
  })
  async aggregateEmployersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: AggregateEmployersOnAccountArgs
  ): Promise<AggregateEmployersOnAccount> {
    return getPrismaFromContext(ctx).employersOnAccount.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }

  @TypeGraphQL.Query((_returns) => [EmployersOnAccountGroupBy], {
    nullable: false,
  })
  async groupByEmployersOnAccount(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: GroupByEmployersOnAccountArgs
  ): Promise<EmployersOnAccountGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).employersOnAccount.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(
          ([_, v]) => v != null
        )
      ),
    });
  }
}
