import * as TypeGraphQL from "type-graphql";

export enum PhoneScalarFieldEnum {
  id = "id",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
  deletedDate = "deletedDate",
  deleted = "deleted",
  accountId = "accountId",
  addressId = "addressId",
  phone = "phone",
  "public" = "public"
}
TypeGraphQL.registerEnumType(PhoneScalarFieldEnum, {
  name: "PhoneScalarFieldEnum",
  description: undefined,
});
