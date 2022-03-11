import * as TypeGraphQL from "type-graphql";

export enum ApplicationScalarFieldEnum {
  id = "id",
  name = "name",
  accountId = "accountId",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
  deleted = "deleted"
}
TypeGraphQL.registerEnumType(ApplicationScalarFieldEnum, {
  name: "ApplicationScalarFieldEnum",
  description: undefined,
});
