import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { AggregateVenueStyleArgs } from "./args/AggregateVenueStyleArgs";
import { CreateManyVenueStyleArgs } from "./args/CreateManyVenueStyleArgs";
import { CreateVenueStyleArgs } from "./args/CreateVenueStyleArgs";
import { DeleteManyVenueStyleArgs } from "./args/DeleteManyVenueStyleArgs";
import { DeleteVenueStyleArgs } from "./args/DeleteVenueStyleArgs";
import { FindFirstVenueStyleArgs } from "./args/FindFirstVenueStyleArgs";
import { FindManyVenueStyleArgs } from "./args/FindManyVenueStyleArgs";
import { FindUniqueVenueStyleArgs } from "./args/FindUniqueVenueStyleArgs";
import { GroupByVenueStyleArgs } from "./args/GroupByVenueStyleArgs";
import { UpdateManyVenueStyleArgs } from "./args/UpdateManyVenueStyleArgs";
import { UpdateVenueStyleArgs } from "./args/UpdateVenueStyleArgs";
import { UpsertVenueStyleArgs } from "./args/UpsertVenueStyleArgs";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";
import { VenueStyle } from "../../../models/VenueStyle";
import { AffectedRowsOutput } from "../../outputs/AffectedRowsOutput";
import { AggregateVenueStyle } from "../../outputs/AggregateVenueStyle";
import { VenueStyleGroupBy } from "../../outputs/VenueStyleGroupBy";

@TypeGraphQL.Resolver(_of => VenueStyle)
export class VenueStyleCrudResolver {
  @TypeGraphQL.Query(_returns => VenueStyle, {
    nullable: true
  })
  async venueStyle(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindUniqueVenueStyleArgs): Promise<VenueStyle | null> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).venueStyle.findUnique({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => VenueStyle, {
    nullable: true
  })
  async findFirstVenueStyle(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindFirstVenueStyleArgs): Promise<VenueStyle | null> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).venueStyle.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => [VenueStyle], {
    nullable: false
  })
  async venueStyles(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindManyVenueStyleArgs): Promise<VenueStyle[]> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).venueStyle.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => VenueStyle, {
    nullable: false
  })
  async createVenueStyle(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateVenueStyleArgs): Promise<VenueStyle> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).venueStyle.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => AffectedRowsOutput, {
    nullable: false
  })
  async createManyVenueStyle(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateManyVenueStyleArgs): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).venueStyle.createMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => VenueStyle, {
    nullable: true
  })
  async deleteVenueStyle(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: DeleteVenueStyleArgs): Promise<VenueStyle | null> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).venueStyle.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => VenueStyle, {
    nullable: true
  })
  async updateVenueStyle(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpdateVenueStyleArgs): Promise<VenueStyle | null> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).venueStyle.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => AffectedRowsOutput, {
    nullable: false
  })
  async deleteManyVenueStyle(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: DeleteManyVenueStyleArgs): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).venueStyle.deleteMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => AffectedRowsOutput, {
    nullable: false
  })
  async updateManyVenueStyle(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpdateManyVenueStyleArgs): Promise<AffectedRowsOutput> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).venueStyle.updateMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => VenueStyle, {
    nullable: false
  })
  async upsertVenueStyle(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpsertVenueStyleArgs): Promise<VenueStyle> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).venueStyle.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => AggregateVenueStyle, {
    nullable: false
  })
  async aggregateVenueStyle(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateVenueStyleArgs): Promise<AggregateVenueStyle> {
    return getPrismaFromContext(ctx).venueStyle.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }

  @TypeGraphQL.Query(_returns => [VenueStyleGroupBy], {
    nullable: false
  })
  async groupByVenueStyle(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: GroupByVenueStyleArgs): Promise<VenueStyleGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).venueStyle.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(([_, v]) => v != null)
      ),
    });
  }
}
