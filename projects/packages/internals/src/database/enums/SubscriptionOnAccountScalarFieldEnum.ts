import * as TypeGraphQL from "type-graphql";

export enum SubscriptionOnAccountScalarFieldEnum {
  subscriptionId = "subscriptionId",
  accountId = "accountId",
  active = "active",
  deactivated = "deactivated",
  activated = "activated",
  startedAt = "startedAt",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
  deleted = "deleted"
}
TypeGraphQL.registerEnumType(SubscriptionOnAccountScalarFieldEnum, {
  name: "SubscriptionOnAccountScalarFieldEnum",
  description: undefined,
});
