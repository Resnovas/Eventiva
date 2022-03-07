import * as TypeGraphQL from 'type-graphql';

export enum DomainScalarFieldEnum {
  id = 'id',
  domain = 'domain',
  verified = 'verified',
  dnsType = 'dnsType',
  data = 'data',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  deleted = 'deleted',
}
TypeGraphQL.registerEnumType(DomainScalarFieldEnum, {
  name: 'DomainScalarFieldEnum',
  description: undefined,
});
