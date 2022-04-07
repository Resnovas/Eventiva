import * as TypeGraphQL from "type-graphql";

export enum SubscriptionOrderByRelevanceFieldEnum {
  id = "id",
  name = "name",
  cost = "cost",
  details = "details"
}
TypeGraphQL.registerEnumType(SubscriptionOrderByRelevanceFieldEnum, {
  name: "SubscriptionOrderByRelevanceFieldEnum",
  description: undefined,
});
