import * as TypeGraphQL from "type-graphql";

export enum SIACheckScalarFieldEnum {
  id = "id",
  sia_id = "sia_id",
  status = "status",
  AuthUrl = "AuthUrl",
  pubUrl = "pubUrl",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
  deleted = "deleted",
  error = "error",
  transactionId = "transactionId"
}
TypeGraphQL.registerEnumType(SIACheckScalarFieldEnum, {
  name: "SIACheckScalarFieldEnum",
  description: undefined,
});
