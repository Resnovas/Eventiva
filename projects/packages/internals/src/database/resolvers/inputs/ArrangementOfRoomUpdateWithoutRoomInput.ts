import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ArrangementUpdateOneRequiredWithoutRoomInput } from '../inputs/ArrangementUpdateOneRequiredWithoutRoomInput';
import { DateTimeFieldUpdateOperationsInput } from '../inputs/DateTimeFieldUpdateOperationsInput';
import { IntFieldUpdateOperationsInput } from '../inputs/IntFieldUpdateOperationsInput';
import { NullableStringFieldUpdateOperationsInput } from '../inputs/NullableStringFieldUpdateOperationsInput';

@TypeGraphQL.InputType('ArrangementOfRoomUpdateWithoutRoomInput', {
  isAbstract: true,
})
export class ArrangementOfRoomUpdateWithoutRoomInput {
  @TypeGraphQL.Field((_type) => IntFieldUpdateOperationsInput, {
    nullable: true,
  })
  capacity?: IntFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableStringFieldUpdateOperationsInput, {
    nullable: true,
  })
  details?: NullableStringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  createdAt?: DateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  updatedAt?: DateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => ArrangementUpdateOneRequiredWithoutRoomInput, {
    nullable: true,
  })
  arrangement?: ArrangementUpdateOneRequiredWithoutRoomInput | undefined;
}