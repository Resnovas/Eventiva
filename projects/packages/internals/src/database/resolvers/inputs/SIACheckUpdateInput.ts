import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DateTimeFieldUpdateOperationsInput } from '../inputs/DateTimeFieldUpdateOperationsInput';
import { EnumBadgeStatusFieldUpdateOperationsInput } from '../inputs/EnumBadgeStatusFieldUpdateOperationsInput';
import { NullableDateTimeFieldUpdateOperationsInput } from '../inputs/NullableDateTimeFieldUpdateOperationsInput';
import { NullableStringFieldUpdateOperationsInput } from '../inputs/NullableStringFieldUpdateOperationsInput';
import { SIABadgeUpdateOneWithoutSiaChecksInput } from '../inputs/SIABadgeUpdateOneWithoutSiaChecksInput';
import { StringFieldUpdateOperationsInput } from '../inputs/StringFieldUpdateOperationsInput';
import { TransactionUpdateOneWithoutSIACheckInput } from '../inputs/TransactionUpdateOneWithoutSIACheckInput';

@TypeGraphQL.InputType('SIACheckUpdateInput', {
  isAbstract: true,
})
export class SIACheckUpdateInput {
  @TypeGraphQL.Field((_type) => StringFieldUpdateOperationsInput, {
    nullable: true,
  })
  id?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => EnumBadgeStatusFieldUpdateOperationsInput, {
    nullable: true,
  })
  status?: EnumBadgeStatusFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableStringFieldUpdateOperationsInput, {
    nullable: true,
  })
  AuthUrl?: NullableStringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableStringFieldUpdateOperationsInput, {
    nullable: true,
  })
  pubUrl?: NullableStringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  createdAt?: DateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  updatedAt?: DateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableDateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  deleted?: NullableDateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableStringFieldUpdateOperationsInput, {
    nullable: true,
  })
  error?: NullableStringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => SIABadgeUpdateOneWithoutSiaChecksInput, {
    nullable: true,
  })
  badge?: SIABadgeUpdateOneWithoutSiaChecksInput | undefined;

  @TypeGraphQL.Field((_type) => TransactionUpdateOneWithoutSIACheckInput, {
    nullable: true,
  })
  transactions?: TransactionUpdateOneWithoutSIACheckInput | undefined;
}
