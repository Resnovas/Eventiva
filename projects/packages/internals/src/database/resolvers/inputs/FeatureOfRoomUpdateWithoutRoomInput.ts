import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DateTimeFieldUpdateOperationsInput } from '../inputs/DateTimeFieldUpdateOperationsInput';
import { FeatureUpdateOneRequiredWithoutFeatureOfRoomInput } from '../inputs/FeatureUpdateOneRequiredWithoutFeatureOfRoomInput';
import { NullableDateTimeFieldUpdateOperationsInput } from '../inputs/NullableDateTimeFieldUpdateOperationsInput';

@TypeGraphQL.InputType('FeatureOfRoomUpdateWithoutRoomInput', {
  isAbstract: true,
})
export class FeatureOfRoomUpdateWithoutRoomInput {
  @TypeGraphQL.Field((_type) => GraphQLScalars.JSONResolver, {
    nullable: true,
  })
  data?: Prisma.InputJsonValue | undefined;

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

  @TypeGraphQL.Field(
    (_type) => FeatureUpdateOneRequiredWithoutFeatureOfRoomInput,
    {
      nullable: true,
    }
  )
  feature?: FeatureUpdateOneRequiredWithoutFeatureOfRoomInput | undefined;
}
