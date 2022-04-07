import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { DeleteVenueStyleArgs } from "./args/DeleteVenueStyleArgs";
import { VenueStyle } from "../../../models/VenueStyle";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => VenueStyle)
export class DeleteVenueStyleResolver {
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
}
