import * as TypeGraphQL from 'type-graphql';

export enum FeatureOfRoomScalarFieldEnum {
  roomId = 'roomId',
  featureId = 'featureId',
  data = 'data',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  deleted = 'deleted',
}
TypeGraphQL.registerEnumType(FeatureOfRoomScalarFieldEnum, {
  name: 'FeatureOfRoomScalarFieldEnum',
  description: undefined,
});
