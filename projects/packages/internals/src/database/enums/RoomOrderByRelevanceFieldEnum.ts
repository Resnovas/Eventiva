import * as TypeGraphQL from 'type-graphql';

export enum RoomOrderByRelevanceFieldEnum {
  id = 'id',
  addressId = 'addressId',
  name = 'name',
  floor = 'floor',
  building = 'building',
  length = 'length',
  width = 'width',
  height = 'height',
}
TypeGraphQL.registerEnumType(RoomOrderByRelevanceFieldEnum, {
  name: 'RoomOrderByRelevanceFieldEnum',
  description: undefined,
});
