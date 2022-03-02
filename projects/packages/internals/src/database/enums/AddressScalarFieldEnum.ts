import * as TypeGraphQL from 'type-graphql';

export enum AddressScalarFieldEnum {
  id = 'id',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  accountId = 'accountId',
  type = 'type',
  coords = 'coords',
  street = 'street',
  city = 'city',
  state = 'state',
  country = 'country',
  zipcode = 'zipcode',
  addressName = 'addressName',
  name = 'name',
  parking = 'parking',
  website = 'website',
  hoursOfOperation = 'hoursOfOperation',
  features = 'features',
  details = 'details',
  'public' = 'public',
  primaryaccountId = 'primaryaccountId',
  deleted = 'deleted',
}
TypeGraphQL.registerEnumType(AddressScalarFieldEnum, {
  name: 'AddressScalarFieldEnum',
  description: undefined,
});
