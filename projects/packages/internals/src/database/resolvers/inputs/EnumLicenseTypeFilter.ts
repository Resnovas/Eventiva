import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { NestedEnumLicenseTypeFilter } from '../inputs/NestedEnumLicenseTypeFilter';
import { LicenseType } from '../../enums/LicenseType';

@TypeGraphQL.InputType('EnumLicenseTypeFilter', {
  isAbstract: true,
})
export class EnumLicenseTypeFilter {
  @TypeGraphQL.Field((_type) => LicenseType, {
    nullable: true,
  })
  equals?: 'FRONTLINE' | 'NON_FRONTLINE' | undefined;

  @TypeGraphQL.Field((_type) => [LicenseType], {
    nullable: true,
  })
  in?: Array<'FRONTLINE' | 'NON_FRONTLINE'> | undefined;

  @TypeGraphQL.Field((_type) => [LicenseType], {
    nullable: true,
  })
  notIn?: Array<'FRONTLINE' | 'NON_FRONTLINE'> | undefined;

  @TypeGraphQL.Field((_type) => NestedEnumLicenseTypeFilter, {
    nullable: true,
  })
  not?: NestedEnumLicenseTypeFilter | undefined;
}
