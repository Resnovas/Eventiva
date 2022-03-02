import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../scalars';
import { Account } from '../models/Account';
import { SIACheck } from '../models/SIACheck';
import { LicenseSector } from '../enums/LicenseSector';
import { LicenseType } from '../enums/LicenseType';
import { SIABadgeCount } from '../resolvers/outputs/SIABadgeCount';

@TypeGraphQL.ObjectType('SIABadge', {
  isAbstract: true,
})
export class SIABadge {
  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: false,
  })
  id!: number;

  @TypeGraphQL.Field((_type) => LicenseSector, {
    nullable: false,
  })
  licenseSector!:
    | 'CVIT'
    | 'CP'
    | 'DS'
    | 'CCTV'
    | 'SG'
    | 'VI'
    | 'KH'
    | 'UNKNOWN';

  @TypeGraphQL.Field((_type) => LicenseType, {
    nullable: false,
  })
  type!: 'FRONTLINE' | 'NON_FRONTLINE';

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  licenseExplanation!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  additionalTerms!: string;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  createdAt!: Date;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  active?: Date | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  expiry?: Date | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  updatedAt!: Date;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  deleted?: Date | null;

  siaChecks?: SIACheck[];

  account?: Account | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  account_id?: string | null;

  @TypeGraphQL.Field((_type) => SIABadgeCount, {
    nullable: true,
  })
  _count?: SIABadgeCount | null;
}
