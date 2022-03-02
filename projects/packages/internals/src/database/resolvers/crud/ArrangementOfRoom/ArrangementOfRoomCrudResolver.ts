import * as TypeGraphQL from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { AggregateArrangementOfRoomArgs } from './args/AggregateArrangementOfRoomArgs';
import { CreateArrangementOfRoomArgs } from './args/CreateArrangementOfRoomArgs';
import { CreateManyArrangementOfRoomArgs } from './args/CreateManyArrangementOfRoomArgs';
import { DeleteArrangementOfRoomArgs } from './args/DeleteArrangementOfRoomArgs';
import { DeleteManyArrangementOfRoomArgs } from './args/DeleteManyArrangementOfRoomArgs';
import { FindFirstArrangementOfRoomArgs } from './args/FindFirstArrangementOfRoomArgs';
import { FindManyArrangementOfRoomArgs } from './args/FindManyArrangementOfRoomArgs';
import { FindUniqueArrangementOfRoomArgs } from './args/FindUniqueArrangementOfRoomArgs';
import { GroupByArrangementOfRoomArgs } from './args/GroupByArrangementOfRoomArgs';
import { UpdateArrangementOfRoomArgs } from './args/UpdateArrangementOfRoomArgs';
import { UpdateManyArrangementOfRoomArgs } from './args/UpdateManyArrangementOfRoomArgs';
import { UpsertArrangementOfRoomArgs } from './args/UpsertArrangementOfRoomArgs';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';
import { ArrangementOfRoom } from '../../../models/ArrangementOfRoom';
import { AffectedRowsOutput } from '../../outputs/AffectedRowsOutput';
import { AggregateArrangementOfRoom } from '../../outputs/AggregateArrangementOfRoom';
import { ArrangementOfRoomGroupBy } from '../../outputs/ArrangementOfRoomGroupBy';

@TypeGraphQL.Resolver((_of) => ArrangementOfRoom)
export class ArrangementOfRoomCrudResolver {
  @TypeGraphQL.Query((_returns) => ArrangementOfRoom, {
    nullable: true,
  })
  async arrangementOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindUniqueArrangementOfRoomArgs
  ): Promise<ArrangementOfRoom | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).arrangementOfRoom.findUnique({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query((_returns) => ArrangementOfRoom, {
    nullable: true,
  })
  async findFirstArrangementOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindFirstArrangementOfRoomArgs
  ): Promise<ArrangementOfRoom | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).arrangementOfRoom.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query((_returns) => [ArrangementOfRoom], {
    nullable: false,
  })
  async arrangementOfRooms(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindManyArrangementOfRoomArgs
  ): Promise<ArrangementOfRoom[]> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).arrangementOfRoom.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => ArrangementOfRoom, {
    nullable: false,
  })
  async createArrangementOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: CreateArrangementOfRoomArgs
  ): Promise<ArrangementOfRoom> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).arrangementOfRoom.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => AffectedRowsOutput, {
    nullable: false,
  })
  async createManyArrangementOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: CreateManyArrangementOfRoomArgs
  ): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).arrangementOfRoom.createMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => ArrangementOfRoom, {
    nullable: true,
  })
  async deleteArrangementOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: DeleteArrangementOfRoomArgs
  ): Promise<ArrangementOfRoom | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).arrangementOfRoom.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => ArrangementOfRoom, {
    nullable: true,
  })
  async updateArrangementOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpdateArrangementOfRoomArgs
  ): Promise<ArrangementOfRoom | null> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).arrangementOfRoom.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => AffectedRowsOutput, {
    nullable: false,
  })
  async deleteManyArrangementOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: DeleteManyArrangementOfRoomArgs
  ): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).arrangementOfRoom.deleteMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => AffectedRowsOutput, {
    nullable: false,
  })
  async updateManyArrangementOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpdateManyArrangementOfRoomArgs
  ): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).arrangementOfRoom.updateMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation((_returns) => ArrangementOfRoom, {
    nullable: false,
  })
  async upsertArrangementOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UpsertArrangementOfRoomArgs
  ): Promise<ArrangementOfRoom> {
    const { _count } = transformFields(graphqlFields(info as any));
    return getPrismaFromContext(ctx).arrangementOfRoom.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query((_returns) => AggregateArrangementOfRoom, {
    nullable: false,
  })
  async aggregateArrangementOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: AggregateArrangementOfRoomArgs
  ): Promise<AggregateArrangementOfRoom> {
    return getPrismaFromContext(ctx).arrangementOfRoom.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }

  @TypeGraphQL.Query((_returns) => [ArrangementOfRoomGroupBy], {
    nullable: false,
  })
  async groupByArrangementOfRoom(
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: GroupByArrangementOfRoomArgs
  ): Promise<ArrangementOfRoomGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).arrangementOfRoom.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(
          ([_, v]) => v != null
        )
      ),
    });
  }
}
