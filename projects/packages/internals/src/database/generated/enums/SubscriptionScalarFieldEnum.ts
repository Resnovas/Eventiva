import * as TypeGraphQL from "type-graphql";

export enum SubscriptionScalarFieldEnum {
  id = "id",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
  deletedDate = "deletedDate",
  deleted = "deleted",
  name = "name",
  cost = "cost",
  details = "details"
}
TypeGraphQL.registerEnumType(SubscriptionScalarFieldEnum, {
  name: "SubscriptionScalarFieldEnum",
  description: undefined,
});
