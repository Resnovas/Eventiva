import * as TypeGraphQL from "type-graphql";

export enum AccountScalarFieldEnum {
  id = "id",
  prn = "prn",
  username = "username",
  accountType = "accountType",
  subsciption = "subsciption",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
  lastLogin = "lastLogin",
  applied = "applied",
  promoted = "promoted",
  retired = "retired",
  title = "title",
  firstname = "firstname",
  midname = "midname",
  lastname = "lastname",
  Salutation = "Salutation",
  dob = "dob",
  sex = "sex",
  label = "label",
  password = "password",
  resetPasswordToken = "resetPasswordToken",
  resetPasswordExpires = "resetPasswordExpires",
  deletedDate = "deletedDate",
  deleted = "deleted"
}
TypeGraphQL.registerEnumType(AccountScalarFieldEnum, {
  name: "AccountScalarFieldEnum",
  description: undefined,
});
