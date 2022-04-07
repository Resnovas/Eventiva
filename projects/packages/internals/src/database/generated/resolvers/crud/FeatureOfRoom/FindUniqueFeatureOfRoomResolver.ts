import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { FindUniqueFeatureOfRoomArgs } from "./args/FindUniqueFeatureOfRoomArgs";
import { FeatureOfRoom } from "../../../models/FeatureOfRoom";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => FeatureOfRoom)
export class FindUniqueFeatureOfRoomResolver {
  @TypeGraphQL.Query(_returns => FeatureOfRoom, {
    nullable: true
  })
  async featureOfRoom(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindUniqueFeatureOfRoomArgs): Promise<FeatureOfRoom | null> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).featureOfRoom.findUnique({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
