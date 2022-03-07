import * as TypeGraphQL from 'type-graphql';

export enum LicenseSector {
  CVIT = 'CVIT',
  CP = 'CP',
  DS = 'DS',
  CCTV = 'CCTV',
  SG = 'SG',
  VI = 'VI',
  KH = 'KH',
  UNKNOWN = 'UNKNOWN',
}
TypeGraphQL.registerEnumType(LicenseSector, {
  name: 'LicenseSector',
  description: undefined,
});
