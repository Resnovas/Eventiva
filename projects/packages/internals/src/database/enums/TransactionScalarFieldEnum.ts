import * as TypeGraphQL from 'type-graphql';

export enum TransactionScalarFieldEnum {
  id = 'id',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  deleted = 'deleted',
  accountId = 'accountId',
  data = 'data',
}
TypeGraphQL.registerEnumType(TransactionScalarFieldEnum, {
  name: 'TransactionScalarFieldEnum',
  description: undefined,
});