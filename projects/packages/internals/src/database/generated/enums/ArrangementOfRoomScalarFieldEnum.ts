import * as TypeGraphQL from "type-graphql";

export enum ArrangementOfRoomScalarFieldEnum {
  roomId = "roomId",
  arrangementId = "arrangementId",
  capacity = "capacity",
  details = "details",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
  deletedDate = "deletedDate",
  deleted = "deleted"
}
TypeGraphQL.registerEnumType(ArrangementOfRoomScalarFieldEnum, {
  name: "ArrangementOfRoomScalarFieldEnum",
  description: undefined,
});
