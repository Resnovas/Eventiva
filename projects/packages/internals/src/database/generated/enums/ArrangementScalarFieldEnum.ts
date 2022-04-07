import * as TypeGraphQL from "type-graphql";

export enum ArrangementScalarFieldEnum {
  id = "id",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
  name = "name",
  icon = "icon",
  details = "details",
  deletedDate = "deletedDate",
  deleted = "deleted"
}
TypeGraphQL.registerEnumType(ArrangementScalarFieldEnum, {
  name: "ArrangementScalarFieldEnum",
  description: undefined,
});
