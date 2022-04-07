import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { AggregateFeatureOfRoomArgs } from "./args/AggregateFeatureOfRoomArgs";
import { FeatureOfRoom } from "../../../models/FeatureOfRoom";
import { AggregateFeatureOfRoom } from "../../outputs/AggregateFeatureOfRoom";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => FeatureOfRoom)
export class AggregateFeatureOfRoomResolver {
  @TypeGraphQL.Query(_returns => AggregateFeatureOfRoom, {
    nullable: false
  })
  async aggregateFeatureOfRoom(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateFeatureOfRoomArgs): Promise<AggregateFeatureOfRoom> {
    return getPrismaFromContext(ctx).featureOfRoom.aggregate({
      ...args,
      ...transformFields(graphqlFields(info as any)),
    });
  }
}
