import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { LicenseType } from '../../enums/LicenseType';

@TypeGraphQL.InputType('EnumLicenseTypeFieldUpdateOperationsInput', {
  isAbstract: true,
})
export class EnumLicenseTypeFieldUpdateOperationsInput {
  @TypeGraphQL.Field((_type) => LicenseType, {
    nullable: true,
  })
  set?: 'FRONTLINE' | 'NON_FRONTLINE' | undefined;
}
