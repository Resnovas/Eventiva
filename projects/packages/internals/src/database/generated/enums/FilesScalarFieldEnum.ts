import * as TypeGraphQL from "type-graphql";

export enum FilesScalarFieldEnum {
  id = "id",
  name = "name",
  rtwId = "rtwId",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
  deletedDate = "deletedDate",
  deleted = "deleted"
}
TypeGraphQL.registerEnumType(FilesScalarFieldEnum, {
  name: "FilesScalarFieldEnum",
  description: undefined,
});
