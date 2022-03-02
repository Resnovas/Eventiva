import * as TypeGraphQL from 'type-graphql';

export enum SubscriptionScalarFieldEnum {
  id = 'id',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  deleted = 'deleted',
  name = 'name',
  cost = 'cost',
  details = 'details',
}
TypeGraphQL.registerEnumType(SubscriptionScalarFieldEnum, {
  name: 'SubscriptionScalarFieldEnum',
  description: undefined,
});
