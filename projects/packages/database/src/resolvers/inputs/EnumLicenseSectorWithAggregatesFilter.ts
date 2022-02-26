import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { NestedEnumLicenseSectorFilter } from '../inputs/NestedEnumLicenseSectorFilter';
import { NestedEnumLicenseSectorWithAggregatesFilter } from '../inputs/NestedEnumLicenseSectorWithAggregatesFilter';
import { NestedIntFilter } from '../inputs/NestedIntFilter';
import { LicenseSector } from '../../enums/LicenseSector';

@TypeGraphQL.InputType('EnumLicenseSectorWithAggregatesFilter', {
  isAbstract: true,
})
export class EnumLicenseSectorWithAggregatesFilter {
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

  @TypeGraphQL.Field((_type) => NestedEnumLicenseSectorWithAggregatesFilter, {
    nullable: true,
  })
  not?: NestedEnumLicenseSectorWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedIntFilter, {
    nullable: true,
  })
  _count?: NestedIntFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedEnumLicenseSectorFilter, {
    nullable: true,
  })
  _min?: NestedEnumLicenseSectorFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedEnumLicenseSectorFilter, {
    nullable: true,
  })
  _max?: NestedEnumLicenseSectorFilter | undefined;
}
