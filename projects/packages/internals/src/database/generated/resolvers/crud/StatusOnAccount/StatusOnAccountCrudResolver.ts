import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { AggregateStatusOnAccountArgs } from "./args/AggregateStatusOnAccountArgs";
import { CreateManyStatusOnAccountArgs } from "./args/CreateManyStatusOnAccountArgs";
import { CreateStatusOnAccountArgs } from "./args/CreateStatusOnAccountArgs";
import { DeleteManyStatusOnAccountArgs } from "./args/DeleteManyStatusOnAccountArgs";
import { DeleteStatusOnAccountArgs } from "./args/DeleteStatusOnAccountArgs";
import { FindFirstStatusOnAccountArgs } from "./args/FindFirstStatusOnAccountArgs";
import { FindManyStatusOnAccountArgs } from "./args/FindManyStatusOnAccountArgs";
import { FindUniqueStatusOnAccountArgs } from "./args/FindUniqueStatusOnAccountArgs";
import { GroupByStatusOnAccountArgs } from "./args/GroupByStatusOnAccountArgs";
import { UpdateManyStatusOnAccountArgs } from "./args/UpdateManyStatusOnAccountArgs";
import { UpdateStatusOnAccountArgs } from "./args/UpdateStatusOnAccountArgs";
import { UpsertStatusOnAccountArgs } from "./args/UpsertStatusOnAccountArgs";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";
import { StatusOnAccount } from "../../../models/StatusOnAccount";
import { AffectedRowsOutput } from "../../outputs/AffectedRowsOutput";
import { AggregateStatusOnAccount } from "../../outputs/AggregateStatusOnAccount";
import { StatusOnAccountGroupBy } from "../../outputs/StatusOnAccountGroupBy";

@TypeGraphQL.Resolver(_of => StatusOnAccount)
export class StatusOnAccountCrudResolver {
  @TypeGraphQL.Query(_returns => StatusOnAccount, {
    nullable: true
  })
  async statusOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindUniqueStatusOnAccountArgs): Promise<StatusOnAccount | null> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).statusOnAccount.findUnique({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => StatusOnAccount, {
    nullable: true
  })
  async findFirstStatusOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindFirstStatusOnAccountArgs): Promise<StatusOnAccount | null> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).statusOnAccount.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => [StatusOnAccount], {
    nullable: false
  })
  async statusOnAccounts(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindManyStatusOnAccountArgs): Promise<StatusOnAccount[]> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).statusOnAccount.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => StatusOnAccount, {
    nullable: false
  })
  async createStatusOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateStatusOnAccountArgs): Promise<StatusOnAccount> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).statusOnAccount.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => AffectedRowsOutput, {
    nullable: false
  })
  async createManyStatusOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateManyStatusOnAccountArgs): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).statusOnAccount.createMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => StatusOnAccount, {
    nullable: true
  })
  async deleteStatusOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: DeleteStatusOnAccountArgs): Promise<StatusOnAccount | null> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).statusOnAccount.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => StatusOnAccount, {
    nullable: true
  })
  async updateStatusOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpdateStatusOnAccountArgs): Promise<StatusOnAccount | null> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).statusOnAccount.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => AffectedRowsOutput, {
    nullable: false
  })
  async deleteManyStatusOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: DeleteManyStatusOnAccountArgs): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).statusOnAccount.deleteMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => AffectedRowsOutput, {
    nullable: false
  })
  async updateManyStatusOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpdateManyStatusOnAccountArgs): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).statusOnAccount.updateMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => StatusOnAccount, {
    nullable: false
  })
  async upsertStatusOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpsertStatusOnAccountArgs): Promise<StatusOnAccount> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).statusOnAccount.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => AggregateStatusOnAccount, {
    nullable: false
  })
  async aggregateStatusOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateStatusOnAccountArgs): Promise<AggregateStatusOnAccount> {
    return getPrismaFromContext(ctx).statusOnAccount.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }

  @TypeGraphQL.Query(_returns => [StatusOnAccountGroupBy], {
    nullable: false
  })
  async groupByStatusOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: GroupByStatusOnAccountArgs): Promise<StatusOnAccountGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).statusOnAccount.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(([_, v]) => v != null)
      ),
    });
  }
}
