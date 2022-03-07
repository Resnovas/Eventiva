import * as TypeGraphQL from 'type-graphql';

export enum StatusScalarFieldEnum {
  id = 'id',
  name = 'name',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  deleted = 'deleted',
}
TypeGraphQL.registerEnumType(StatusScalarFieldEnum, {
  name: 'StatusScalarFieldEnum',
  description: undefined,
});
