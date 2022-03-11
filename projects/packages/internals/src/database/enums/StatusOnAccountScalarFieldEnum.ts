import * as TypeGraphQL from "type-graphql";

export enum StatusOnAccountScalarFieldEnum {
  statusId = "statusId",
  accountId = "accountId",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
  deleted = "deleted"
}
TypeGraphQL.registerEnumType(StatusOnAccountScalarFieldEnum, {
  name: "StatusOnAccountScalarFieldEnum",
  description: undefined,
});
