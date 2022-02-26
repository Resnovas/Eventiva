import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { AggregateFeatureOfRoomArgs } from './args/AggregateFeatureOfRoomArgs';
import { CreateFeatureOfRoomArgs } from './args/CreateFeatureOfRoomArgs';
import { CreateManyFeatureOfRoomArgs } from './args/CreateManyFeatureOfRoomArgs';
import { DeleteFeatureOfRoomArgs } from './args/DeleteFeatureOfRoomArgs';
import { DeleteManyFeatureOfRoomArgs } from './args/DeleteManyFeatureOfRoomArgs';
import { FindFirstFeatureOfRoomArgs } from './args/FindFirstFeatureOfRoomArgs';
import { FindManyFeatureOfRoomArgs } from './args/FindManyFeatureOfRoomArgs';
import { FindUniqueFeatureOfRoomArgs } from './args/FindUniqueFeatureOfRoomArgs';
import { GroupByFeatureOfRoomArgs } from './args/GroupByFeatureOfRoomArgs';
import { UpdateFeatureOfRoomArgs } from './args/UpdateFeatureOfRoomArgs';
import { UpdateManyFeatureOfRoomArgs } from './args/UpdateManyFeatureOfRoomArgs';
import { UpsertFeatureOfRoomArgs } from './args/UpsertFeatureOfRoomArgs';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';
import { FeatureOfRoom } from '../../../models/FeatureOfRoom';
import { AffectedRowsOutput } from '../../outputs/AffectedRowsOutput';
import { AggregateFeatureOfRoom } from '../../outputs/AggregateFeatureOfRoom';
import { FeatureOfRoomGroupBy } from '../../outputs/FeatureOfRoomGroupBy';

@TypeGraphQL.Resolver((_of) => FeatureOfRoom)
export class FeatureOfRoomCrudResolver {
  @TypeGraphQL.Query((_returns) => FeatureOfRoom, {
    nullable: true,
  })
  async featureOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindUniqueFeatureOfRoomArgs
  ): Promise<FeatureOfRoom | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfRoom.findUnique({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query((_returns) => FeatureOfRoom, {
    nullable: true,
  })
  async findFirstFeatureOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindFirstFeatureOfRoomArgs
  ): Promise<FeatureOfRoom | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfRoom.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query((_returns) => [FeatureOfRoom], {
    nullable: false,
  })
  async featureOfRooms(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindManyFeatureOfRoomArgs
  ): Promise<FeatureOfRoom[]> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfRoom.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => FeatureOfRoom, {
    nullable: false,
  })
  async createFeatureOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: CreateFeatureOfRoomArgs
  ): Promise<FeatureOfRoom> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfRoom.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => AffectedRowsOutput, {
    nullable: false,
  })
  async createManyFeatureOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: CreateManyFeatureOfRoomArgs
  ): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfRoom.createMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => FeatureOfRoom, {
    nullable: true,
  })
  async deleteFeatureOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: DeleteFeatureOfRoomArgs
  ): Promise<FeatureOfRoom | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfRoom.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => FeatureOfRoom, {
    nullable: true,
  })
  async updateFeatureOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpdateFeatureOfRoomArgs
  ): Promise<FeatureOfRoom | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfRoom.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => AffectedRowsOutput, {
    nullable: false,
  })
  async deleteManyFeatureOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: DeleteManyFeatureOfRoomArgs
  ): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfRoom.deleteMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => AffectedRowsOutput, {
    nullable: false,
  })
  async updateManyFeatureOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpdateManyFeatureOfRoomArgs
  ): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfRoom.updateMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => FeatureOfRoom, {
    nullable: false,
  })
  async upsertFeatureOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpsertFeatureOfRoomArgs
  ): Promise<FeatureOfRoom> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).featureOfRoom.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query((_returns) => AggregateFeatureOfRoom, {
    nullable: false,
  })
  async aggregateFeatureOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: AggregateFeatureOfRoomArgs
  ): Promise<AggregateFeatureOfRoom> {
    return getPrismaFromContext(ctx).featureOfRoom.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }

  @TypeGraphQL.Query((_returns) => [FeatureOfRoomGroupBy], {
    nullable: false,
  })
  async groupByFeatureOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: GroupByFeatureOfRoomArgs
  ): Promise<FeatureOfRoomGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).featureOfRoom.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(
          ([_, v]) => v != null
        )
      ),
    });
  }
}
