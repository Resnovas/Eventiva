import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { FindManyVenueStyleArgs } from "./args/FindManyVenueStyleArgs";
import { VenueStyle } from "../../../models/VenueStyle";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => VenueStyle)
export class FindManyVenueStyleResolver {
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
}
