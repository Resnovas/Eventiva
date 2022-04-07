import * as TypeGraphQL from "type-graphql";

export enum ManagersOnAccountScalarFieldEnum {
  accountId = "accountId",
  managersId = "managersId",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
  deletedDate = "deletedDate",
  deleted = "deleted"
}
TypeGraphQL.registerEnumType(ManagersOnAccountScalarFieldEnum, {
  name: "ManagersOnAccountScalarFieldEnum",
  description: undefined,
});
