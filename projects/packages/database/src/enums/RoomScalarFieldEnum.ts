import * as TypeGraphQL from 'type-graphql';

export enum RoomScalarFieldEnum {
  id = 'id',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  deleted = 'deleted',
  addressId = 'addressId',
  name = 'name',
  floor = 'floor',
  building = 'building',
  accessibility = 'accessibility',
  checkin = 'checkin',
  checkout = 'checkout',
  length = 'length',
  width = 'width',
  height = 'height',
}
TypeGraphQL.registerEnumType(RoomScalarFieldEnum, {
  name: 'RoomScalarFieldEnum',
  description: undefined,
});
