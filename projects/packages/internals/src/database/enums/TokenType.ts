import * as TypeGraphQL from "type-graphql";

export enum TokenType {
  API = "API",
  PERSONAL = "PERSONAL",
  SYSTEM = "SYSTEM"
}
TypeGraphQL.registerEnumType(TokenType, {
  name: "TokenType",
  description: undefined,
});
