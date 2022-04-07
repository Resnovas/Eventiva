import * as TypeGraphQL from "type-graphql";

export enum EmployersOnAccountScalarFieldEnum {
  accountId = "accountId",
  employerId = "employerId",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
  deletedDate = "deletedDate",
  deleted = "deleted"
}
TypeGraphQL.registerEnumType(EmployersOnAccountScalarFieldEnum, {
  name: "EmployersOnAccountScalarFieldEnum",
  description: undefined,
});
