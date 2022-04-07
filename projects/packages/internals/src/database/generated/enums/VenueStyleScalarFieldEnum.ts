import * as TypeGraphQL from "type-graphql";

export enum VenueStyleScalarFieldEnum {
  id = "id",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
  name = "name",
  details = "details",
  deletedDate = "deletedDate",
  deleted = "deleted"
}
TypeGraphQL.registerEnumType(VenueStyleScalarFieldEnum, {
  name: "VenueStyleScalarFieldEnum",
  description: undefined,
});
