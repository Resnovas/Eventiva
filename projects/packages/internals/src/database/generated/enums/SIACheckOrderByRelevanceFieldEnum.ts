import * as TypeGraphQL from "type-graphql";

export enum SIACheckOrderByRelevanceFieldEnum {
  id = "id",
  AuthUrl = "AuthUrl",
  pubUrl = "pubUrl",
  error = "error",
  transactionId = "transactionId"
}
TypeGraphQL.registerEnumType(SIACheckOrderByRelevanceFieldEnum, {
  name: "SIACheckOrderByRelevanceFieldEnum",
  description: undefined,
});
