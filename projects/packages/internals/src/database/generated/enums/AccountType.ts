import * as TypeGraphQL from "type-graphql";

export enum AccountType {
  USER = "USER",
  BUSINESS = "BUSINESS",
  PROVIDER = "PROVIDER"
}
TypeGraphQL.registerEnumType(AccountType, {
  name: "AccountType",
  description: undefined,
});
