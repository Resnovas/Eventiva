import * as TypeGraphQL from 'type-graphql';

export enum AddressOrderByRelevanceFieldEnum {
  id = 'id',
  accountId = 'accountId',
  coords = 'coords',
  street = 'street',
  city = 'city',
  state = 'state',
  country = 'country',
  zipcode = 'zipcode',
  addressName = 'addressName',
  name = 'name',
  website = 'website',
  features = 'features',
  primaryaccountId = 'primaryaccountId',
}
TypeGraphQL.registerEnumType(AddressOrderByRelevanceFieldEnum, {
  name: 'AddressOrderByRelevanceFieldEnum',
  description: undefined,
});
