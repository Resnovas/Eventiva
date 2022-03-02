import * as TypeGraphQL from 'type-graphql';

export enum dnsType {
  TXT = 'TXT',
  CNAME = 'CNAME',
}
TypeGraphQL.registerEnumType(dnsType, {
  name: 'dnsType',
  description: undefined,
});
