import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { AggregateVenueStyleArgs } from "./args/AggregateVenueStyleArgs";
import { VenueStyle } from "../../../models/VenueStyle";
import { AggregateVenueStyle } from "../../outputs/AggregateVenueStyle";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => VenueStyle)
export class AggregateVenueStyleResolver {
  @TypeGraphQL.Query(_returns => AggregateVenueStyle, {
    nullable: false
  })
  async aggregateVenueStyle(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateVenueStyleArgs): Promise<AggregateVenueStyle> {
    return getPrismaFromContext(ctx).venueStyle.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
