import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DateTimeFieldUpdateOperationsInput } from '../inputs/DateTimeFieldUpdateOperationsInput';
import { EnumLicenseSectorFieldUpdateOperationsInput } from '../inputs/EnumLicenseSectorFieldUpdateOperationsInput';
import { EnumLicenseTypeFieldUpdateOperationsInput } from '../inputs/EnumLicenseTypeFieldUpdateOperationsInput';
import { IntFieldUpdateOperationsInput } from '../inputs/IntFieldUpdateOperationsInput';
import { NullableDateTimeFieldUpdateOperationsInput } from '../inputs/NullableDateTimeFieldUpdateOperationsInput';
import { StringFieldUpdateOperationsInput } from '../inputs/StringFieldUpdateOperationsInput';

@TypeGraphQL.InputType('SIABadgeUpdateManyMutationInput', {
  isAbstract: true,
})
export class SIABadgeUpdateManyMutationInput {
  @TypeGraphQL.Field((_type) => IntFieldUpdateOperationsInput, {
    nullable: true,
  })
  id?: IntFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => EnumLicenseSectorFieldUpdateOperationsInput, {
    nullable: true,
  })
  licenseSector?: EnumLicenseSectorFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => EnumLicenseTypeFieldUpdateOperationsInput, {
    nullable: true,
  })
  type?: EnumLicenseTypeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => StringFieldUpdateOperationsInput, {
    nullable: true,
  })
  licenseExplanation?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => StringFieldUpdateOperationsInput, {
    nullable: true,
  })
  additionalTerms?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  createdAt?: DateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableDateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  active?: NullableDateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableDateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  expiry?: NullableDateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  updatedAt?: DateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableDateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  deleted?: NullableDateTimeFieldUpdateOperationsInput | undefined;
}
