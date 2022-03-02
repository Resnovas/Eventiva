import * as TypeGraphQL from 'type-graphql';

export enum TokenScalarFieldEnum {
  id = 'id',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  type = 'type',
  value = 'value',
  valid = 'valid',
  expiry = 'expiry',
  apiToken = 'apiToken',
}
TypeGraphQL.registerEnumType(TokenScalarFieldEnum, {
  name: 'TokenScalarFieldEnum',
  description: undefined,
});
