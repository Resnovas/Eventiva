import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { LicenseSector } from '../../enums/LicenseSector';

@TypeGraphQL.InputType('NestedEnumLicenseSectorFilter', {
  isAbstract: true,
})
export class NestedEnumLicenseSectorFilter {
  @TypeGraphQL.Field((_type) => LicenseSector, {
    nullable: true,
  })
  equals?:
    | 'CVIT'
    | 'CP'
    | 'DS'
    | 'CCTV'
    | 'SG'
    | 'VI'
    | 'KH'
    | 'UNKNOWN'
    | undefined;

  @TypeGraphQL.Field((_type) => [LicenseSector], {
    nullable: true,
  })
  in?:
    | Array<'CVIT' | 'CP' | 'DS' | 'CCTV' | 'SG' | 'VI' | 'KH' | 'UNKNOWN'>
    | undefined;

  @TypeGraphQL.Field((_type) => [LicenseSector], {
    nullable: true,
  })
  notIn?:
    | Array<'CVIT' | 'CP' | 'DS' | 'CCTV' | 'SG' | 'VI' | 'KH' | 'UNKNOWN'>
    | undefined;

  @TypeGraphQL.Field((_type) => NestedEnumLicenseSectorFilter, {
    nullable: true,
  })
  not?: NestedEnumLicenseSectorFilter | undefined;
}
