import * as TypeGraphQL from "type-graphql";

export enum TokenOrderByRelevanceFieldEnum {
  id = "id",
  value = "value",
  apiToken = "apiToken"
}
TypeGraphQL.registerEnumType(TokenOrderByRelevanceFieldEnum, {
  name: "TokenOrderByRelevanceFieldEnum",
  description: undefined,
});
