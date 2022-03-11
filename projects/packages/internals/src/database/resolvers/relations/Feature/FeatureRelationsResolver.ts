import * as TypeGraphQL from "type-graphql";
import { Feature } from "../../../models/Feature";
import { FeatureOfAddress } from "../../../models/FeatureOfAddress";
import { FeatureOfRoom } from "../../../models/FeatureOfRoom";
import { FeatureFeatureOfAddressArgs } from "./args/FeatureFeatureOfAddressArgs";
import { FeatureFeatureOfRoomArgs } from "./args/FeatureFeatureOfRoomArgs";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Feature)
export class FeatureRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => [FeatureOfRoom], {
    nullable: false
  })
  async featureOfRoom(@TypeGraphQL.Root() feature: Feature, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: FeatureFeatureOfRoomArgs): Promise<FeatureOfRoom[]> {
    return getPrismaFromContext(ctx).feature.findUnique({
      where: {
        id: feature.id,
      },
    }).featureOfRoom(args);
  }

  @TypeGraphQL.FieldResolver(_type => [FeatureOfAddress], {
    nullable: false
  })
  async featureOfAddress(@TypeGraphQL.Root() feature: Feature, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: FeatureFeatureOfAddressArgs): Promise<FeatureOfAddress[]> {
    return getPrismaFromContext(ctx).feature.findUnique({
      where: {
        id: feature.id,
      },
    }).featureOfAddress(args);
  }
}
