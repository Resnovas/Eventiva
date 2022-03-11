import * as TypeGraphQL from "type-graphql";

export enum ContactAtAddressScalarFieldEnum {
  accountId = "accountId",
  addressId = "addressId",
  jobTitle = "jobTitle",
  phone = "phone",
  emailId = "emailId",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
  deleted = "deleted"
}
TypeGraphQL.registerEnumType(ContactAtAddressScalarFieldEnum, {
  name: "ContactAtAddressScalarFieldEnum",
  description: undefined,
});
