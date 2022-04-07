import * as TypeGraphQL from "type-graphql";

export enum RTWScalarFieldEnum {
  id = "id",
  name = "name",
  active = "active",
  startDate = "startDate",
  endDate = "endDate",
  accountId = "accountId",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
  deletedDate = "deletedDate",
  deleted = "deleted"
}
TypeGraphQL.registerEnumType(RTWScalarFieldEnum, {
  name: "RTWScalarFieldEnum",
  description: undefined,
});
