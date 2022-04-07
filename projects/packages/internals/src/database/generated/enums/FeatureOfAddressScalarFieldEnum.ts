import * as TypeGraphQL from "type-graphql";

export enum FeatureOfAddressScalarFieldEnum {
  addressId = "addressId",
  featureId = "featureId",
  data = "data",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
  deletedDate = "deletedDate",
  deleted = "deleted"
}
TypeGraphQL.registerEnumType(FeatureOfAddressScalarFieldEnum, {
  name: "FeatureOfAddressScalarFieldEnum",
  description: undefined,
});
