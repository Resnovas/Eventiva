import * as TypeGraphQL from "type-graphql";

export enum AddressType {
  PERSONAL = "PERSONAL",
  BUSINESS = "BUSINESS"
}
TypeGraphQL.registerEnumType(AddressType, {
  name: "AddressType",
  description: undefined,
});
