import * as TypeGraphQL from 'type-graphql';

export enum ContactAtAddressOrderByRelevanceFieldEnum {
  accountId = 'accountId',
  addressId = 'addressId',
  jobTitle = 'jobTitle',
  phone = 'phone',
  emailId = 'emailId',
}
TypeGraphQL.registerEnumType(ContactAtAddressOrderByRelevanceFieldEnum, {
  name: 'ContactAtAddressOrderByRelevanceFieldEnum',
  description: undefined,
});
