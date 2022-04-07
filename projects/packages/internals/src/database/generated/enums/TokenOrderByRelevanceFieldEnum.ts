import * as TypeGraphQL from "type-graphql";

export enum TokenOrderByRelevanceFieldEnum {
  id = "id",
  nickname = "nickname",
  value = "value",
  accountID = "accountID"
}
TypeGraphQL.registerEnumType(TokenOrderByRelevanceFieldEnum, {
  name: "TokenOrderByRelevanceFieldEnum",
  description: undefined,
});
