import * as TypeGraphQL from "type-graphql";

export enum FilesOrderByRelevanceFieldEnum {
  id = "id",
  name = "name",
  rtwId = "rtwId"
}
TypeGraphQL.registerEnumType(FilesOrderByRelevanceFieldEnum, {
  name: "FilesOrderByRelevanceFieldEnum",
  description: undefined,
});
