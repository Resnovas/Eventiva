import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { CreateFeatureOfRoomArgs } from "./args/CreateFeatureOfRoomArgs";
import { FeatureOfRoom } from "../../../models/FeatureOfRoom";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => FeatureOfRoom)
export class CreateFeatureOfRoomResolver {
  @TypeGraphQL.Mutation(_returns => FeatureOfRoom, {
    nullable: false
  })
  async createFeatureOfRoom(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateFeatureOfRoomArgs): Promise<FeatureOfRoom> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).featureOfRoom.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
