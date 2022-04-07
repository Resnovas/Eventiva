import * as TypeGraphQL from "type-graphql";

export enum TokenScalarFieldEnum {
  id = "id",
  nickname = "nickname",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
  type = "type",
  value = "value",
  expiry = "expiry",
  accountID = "accountID",
  deletedDate = "deletedDate",
  deleted = "deleted"
}
TypeGraphQL.registerEnumType(TokenScalarFieldEnum, {
  name: "TokenScalarFieldEnum",
  description: undefined,
});
