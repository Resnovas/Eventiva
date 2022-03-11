import * as TypeGraphQL from "type-graphql";
import { Address } from "../../../models/Address";
import { Feature } from "../../../models/Feature";
import { FeatureOfAddress } from "../../../models/FeatureOfAddress";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => FeatureOfAddress)
export class FeatureOfAddressRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => Feature, {
    nullable: false
  })
  async feature(@TypeGraphQL.Root() featureOfAddress: FeatureOfAddress, @TypeGraphQL.Ctx() ctx: any): Promise<Feature> {
    return getPrismaFromContext(ctx).featureOfAddress.findUnique({
      where: {
        addressId_featureId: {
          addressId: featureOfAddress.addressId,
          featureId: featureOfAddress.featureId,
        },
      },
    }).feature({});
  }

  @TypeGraphQL.FieldResolver(_type => Address, {
    nullable: false
  })
  async address(@TypeGraphQL.Root() featureOfAddress: FeatureOfAddress, @TypeGraphQL.Ctx() ctx: any): Promise<Address> {
    return getPrismaFromContext(ctx).featureOfAddress.findUnique({
      where: {
        addressId_featureId: {
          addressId: featureOfAddress.addressId,
          featureId: featureOfAddress.featureId,
        },
      },
    }).address({});
  }
}
