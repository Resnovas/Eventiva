import * as TypeGraphQL from "type-graphql";

export enum SaltScalarFieldEnum {
  id = "id",
  salt = "salt",
  expiry = "expiry",
  accountID = "accountID",
  deletedDate = "deletedDate",
  deleted = "deleted"
}
TypeGraphQL.registerEnumType(SaltScalarFieldEnum, {
  name: "SaltScalarFieldEnum",
  description: undefined,
});
