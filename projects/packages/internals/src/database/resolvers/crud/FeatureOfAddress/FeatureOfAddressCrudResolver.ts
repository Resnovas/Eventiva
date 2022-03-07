import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { AggregateFeatureOfAddressArgs } from './args/AggregateFeatureOfAddressArgs';
import { CreateFeatureOfAddressArgs } from './args/CreateFeatureOfAddressArgs';
import { CreateManyFeatureOfAddressArgs } from './args/CreateManyFeatureOfAddressArgs';
import { DeleteFeatureOfAddressArgs } from './args/DeleteFeatureOfAddressArgs';
import { DeleteManyFeatureOfAddressArgs } from './args/DeleteManyFeatureOfAddressArgs';
import { FindFirstFeatureOfAddressArgs } from './args/FindFirstFeatureOfAddressArgs';
import { FindManyFeatureOfAddressArgs } from './args/FindManyFeatureOfAddressArgs';
import { FindUniqueFeatureOfAddressArgs } from './args/FindUniqueFeatureOfAddressArgs';
import { GroupByFeatureOfAddressArgs } from './args/GroupByFeatureOfAddressArgs';
import { UpdateFeatureOfAddressArgs } from './args/UpdateFeatureOfAddressArgs';
import { UpdateManyFeatureOfAddressArgs } from './args/UpdateManyFeatureOfAddressArgs';
import { UpsertFeatureOfAddressArgs } from './args/UpsertFeatureOfAddressArgs';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';
import { FeatureOfAddress } from '../../../models/FeatureOfAddress';
import { AffectedRowsOutput } from '../../outputs/AffectedRowsOutput';
import { AggregateFeatureOfAddress } from '../../outputs/AggregateFeatureOfAddress';
import { FeatureOfAddressGroupBy } from '../../outputs/FeatureOfAddressGroupBy';

@TypeGraphQL.Resolver((_of) => FeatureOfAddress)
export class FeatureOfAddressCrudResolver {
  @TypeGraphQL.Query((_returns) => FeatureOfAddress, {
    nullable: true,
  })
  async featureOfAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindUniqueFeatureOfAddressArgs
  ): Promise<FeatureOfAddress | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfAddress.findUnique({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query((_returns) => FeatureOfAddress, {
    nullable: true,
  })
  async findFirstFeatureOfAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindFirstFeatureOfAddressArgs
  ): Promise<FeatureOfAddress | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfAddress.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query((_returns) => [FeatureOfAddress], {
    nullable: false,
  })
  async featureOfAddresses(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindManyFeatureOfAddressArgs
  ): Promise<FeatureOfAddress[]> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfAddress.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => FeatureOfAddress, {
    nullable: false,
  })
  async createFeatureOfAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: CreateFeatureOfAddressArgs
  ): Promise<FeatureOfAddress> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfAddress.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => AffectedRowsOutput, {
    nullable: false,
  })
  async createManyFeatureOfAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: CreateManyFeatureOfAddressArgs
  ): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfAddress.createMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => FeatureOfAddress, {
    nullable: true,
  })
  async deleteFeatureOfAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: DeleteFeatureOfAddressArgs
  ): Promise<FeatureOfAddress | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfAddress.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => FeatureOfAddress, {
    nullable: true,
  })
  async updateFeatureOfAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpdateFeatureOfAddressArgs
  ): Promise<FeatureOfAddress | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfAddress.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => AffectedRowsOutput, {
    nullable: false,
  })
  async deleteManyFeatureOfAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: DeleteManyFeatureOfAddressArgs
  ): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfAddress.deleteMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => AffectedRowsOutput, {
    nullable: false,
  })
  async updateManyFeatureOfAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpdateManyFeatureOfAddressArgs
  ): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfAddress.updateMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => FeatureOfAddress, {
    nullable: false,
  })
  async upsertFeatureOfAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpsertFeatureOfAddressArgs
  ): Promise<FeatureOfAddress> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfAddress.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query((_returns) => AggregateFeatureOfAddress, {
    nullable: false,
  })
  async aggregateFeatureOfAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: AggregateFeatureOfAddressArgs
  ): Promise<AggregateFeatureOfAddress> {
    return getPrismaFromContext(ctx).featureOfAddress.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }

  @TypeGraphQL.Query((_returns) => [FeatureOfAddressGroupBy], {
    nullable: false,
  })
  async groupByFeatureOfAddress(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: GroupByFeatureOfAddressArgs
  ): Promise<FeatureOfAddressGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).featureOfAddress.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(
          ([_, v]) => v != null
        )
      ),
    });
  }
}
