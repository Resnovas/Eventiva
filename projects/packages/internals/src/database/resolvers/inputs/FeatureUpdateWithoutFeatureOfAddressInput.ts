import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DateTimeFieldUpdateOperationsInput } from '../inputs/DateTimeFieldUpdateOperationsInput';
import { EnumFeatureTypeFieldUpdateOperationsInput } from '../inputs/EnumFeatureTypeFieldUpdateOperationsInput';
import { FeatureOfRoomUpdateManyWithoutFeatureInput } from '../inputs/FeatureOfRoomUpdateManyWithoutFeatureInput';
import { NullableDateTimeFieldUpdateOperationsInput } from '../inputs/NullableDateTimeFieldUpdateOperationsInput';
import { StringFieldUpdateOperationsInput } from '../inputs/StringFieldUpdateOperationsInput';

@TypeGraphQL.InputType('FeatureUpdateWithoutFeatureOfAddressInput', {
  isAbstract: true,
})
export class FeatureUpdateWithoutFeatureOfAddressInput {
  @TypeGraphQL.Field((_type) => StringFieldUpdateOperationsInput, {
    nullable: true,
  })
  id?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => StringFieldUpdateOperationsInput, {
    nullable: true,
  })
  name?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => EnumFeatureTypeFieldUpdateOperationsInput, {
    nullable: true,
  })
  type?: EnumFeatureTypeFieldUpdateOperationsInput | undefined;

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

  @TypeGraphQL.Field((_type) => FeatureOfRoomUpdateManyWithoutFeatureInput, {
    nullable: true,
  })
  featureOfRoom?: FeatureOfRoomUpdateManyWithoutFeatureInput | undefined;
}
