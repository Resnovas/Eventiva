import * as TypeGraphQL from 'type-graphql';

export enum LicenseType {
  FRONTLINE = 'FRONTLINE',
  NON_FRONTLINE = 'NON_FRONTLINE',
}
TypeGraphQL.registerEnumType(LicenseType, {
  name: 'LicenseType',
  description: undefined,
});
