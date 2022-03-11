import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { AggregateSubscriptionOnAccountArgs } from "./args/AggregateSubscriptionOnAccountArgs";
import { CreateManySubscriptionOnAccountArgs } from "./args/CreateManySubscriptionOnAccountArgs";
import { CreateSubscriptionOnAccountArgs } from "./args/CreateSubscriptionOnAccountArgs";
import { DeleteManySubscriptionOnAccountArgs } from "./args/DeleteManySubscriptionOnAccountArgs";
import { DeleteSubscriptionOnAccountArgs } from "./args/DeleteSubscriptionOnAccountArgs";
import { FindFirstSubscriptionOnAccountArgs } from "./args/FindFirstSubscriptionOnAccountArgs";
import { FindManySubscriptionOnAccountArgs } from "./args/FindManySubscriptionOnAccountArgs";
import { FindUniqueSubscriptionOnAccountArgs } from "./args/FindUniqueSubscriptionOnAccountArgs";
import { GroupBySubscriptionOnAccountArgs } from "./args/GroupBySubscriptionOnAccountArgs";
import { UpdateManySubscriptionOnAccountArgs } from "./args/UpdateManySubscriptionOnAccountArgs";
import { UpdateSubscriptionOnAccountArgs } from "./args/UpdateSubscriptionOnAccountArgs";
import { UpsertSubscriptionOnAccountArgs } from "./args/UpsertSubscriptionOnAccountArgs";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";
import { SubscriptionOnAccount } from "../../../models/SubscriptionOnAccount";
import { AffectedRowsOutput } from "../../outputs/AffectedRowsOutput";
import { AggregateSubscriptionOnAccount } from "../../outputs/AggregateSubscriptionOnAccount";
import { SubscriptionOnAccountGroupBy } from "../../outputs/SubscriptionOnAccountGroupBy";

@TypeGraphQL.Resolver(_of => SubscriptionOnAccount)
export class SubscriptionOnAccountCrudResolver {
  @TypeGraphQL.Query(_returns => SubscriptionOnAccount, {
    nullable: true
  })
  async subscriptionOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindUniqueSubscriptionOnAccountArgs): Promise<SubscriptionOnAccount | null> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).subscriptionOnAccount.findUnique({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => SubscriptionOnAccount, {
    nullable: true
  })
  async findFirstSubscriptionOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindFirstSubscriptionOnAccountArgs): Promise<SubscriptionOnAccount | null> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).subscriptionOnAccount.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => [SubscriptionOnAccount], {
    nullable: false
  })
  async subscriptionOnAccounts(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindManySubscriptionOnAccountArgs): Promise<SubscriptionOnAccount[]> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).subscriptionOnAccount.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => SubscriptionOnAccount, {
    nullable: false
  })
  async createSubscriptionOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateSubscriptionOnAccountArgs): Promise<SubscriptionOnAccount> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).subscriptionOnAccount.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => AffectedRowsOutput, {
    nullable: false
  })
  async createManySubscriptionOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateManySubscriptionOnAccountArgs): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).subscriptionOnAccount.createMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => SubscriptionOnAccount, {
    nullable: true
  })
  async deleteSubscriptionOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: DeleteSubscriptionOnAccountArgs): Promise<SubscriptionOnAccount | null> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).subscriptionOnAccount.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => SubscriptionOnAccount, {
    nullable: true
  })
  async updateSubscriptionOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpdateSubscriptionOnAccountArgs): Promise<SubscriptionOnAccount | null> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).subscriptionOnAccount.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => AffectedRowsOutput, {
    nullable: false
  })
  async deleteManySubscriptionOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: DeleteManySubscriptionOnAccountArgs): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).subscriptionOnAccount.deleteMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => AffectedRowsOutput, {
    nullable: false
  })
  async updateManySubscriptionOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpdateManySubscriptionOnAccountArgs): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).subscriptionOnAccount.updateMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => SubscriptionOnAccount, {
    nullable: false
  })
  async upsertSubscriptionOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpsertSubscriptionOnAccountArgs): Promise<SubscriptionOnAccount> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).subscriptionOnAccount.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => AggregateSubscriptionOnAccount, {
    nullable: false
  })
  async aggregateSubscriptionOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateSubscriptionOnAccountArgs): Promise<AggregateSubscriptionOnAccount> {
    return getPrismaFromContext(ctx).subscriptionOnAccount.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }

  @TypeGraphQL.Query(_returns => [SubscriptionOnAccountGroupBy], {
    nullable: false
  })
  async groupBySubscriptionOnAccount(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: GroupBySubscriptionOnAccountArgs): Promise<SubscriptionOnAccountGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).subscriptionOnAccount.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(([_, v]) => v != null)
      ),
    });
  }
}
