import * as TypeGraphQL from "type-graphql";

export enum PhoneOrderByRelevanceFieldEnum {
  id = "id",
  accountId = "accountId",
  addressId = "addressId",
  phone = "phone"
}
TypeGraphQL.registerEnumType(PhoneOrderByRelevanceFieldEnum, {
  name: "PhoneOrderByRelevanceFieldEnum",
  description: undefined,
});
