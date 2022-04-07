import * as TypeGraphQL from "type-graphql";

export enum SIABadgeScalarFieldEnum {
  id = "id",
  licenseSector = "licenseSector",
  type = "type",
  licenseExplanation = "licenseExplanation",
  additionalTerms = "additionalTerms",
  createdAt = "createdAt",
  active = "active",
  expiry = "expiry",
  updatedAt = "updatedAt",
  deletedDate = "deletedDate",
  deleted = "deleted",
  account_id = "account_id"
}
TypeGraphQL.registerEnumType(SIABadgeScalarFieldEnum, {
  name: "SIABadgeScalarFieldEnum",
  description: undefined,
});
