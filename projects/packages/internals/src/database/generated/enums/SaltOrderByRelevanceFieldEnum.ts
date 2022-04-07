import * as TypeGraphQL from "type-graphql";

export enum SaltOrderByRelevanceFieldEnum {
  id = "id",
  salt = "salt",
  accountID = "accountID"
}
TypeGraphQL.registerEnumType(SaltOrderByRelevanceFieldEnum, {
  name: "SaltOrderByRelevanceFieldEnum",
  description: undefined,
});
