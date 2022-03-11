import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { CreateVenueStyleArgs } from "./args/CreateVenueStyleArgs";
import { VenueStyle } from "../../../models/VenueStyle";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => VenueStyle)
export class CreateVenueStyleResolver {
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
}
