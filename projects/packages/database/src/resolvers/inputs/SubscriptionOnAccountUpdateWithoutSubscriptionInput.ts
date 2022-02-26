import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountUpdateOneRequiredWithoutSubscriptionInput } from '../inputs/AccountUpdateOneRequiredWithoutSubscriptionInput';
import { BoolFieldUpdateOperationsInput } from '../inputs/BoolFieldUpdateOperationsInput';
import { DateTimeFieldUpdateOperationsInput } from '../inputs/DateTimeFieldUpdateOperationsInput';
import { NullableDateTimeFieldUpdateOperationsInput } from '../inputs/NullableDateTimeFieldUpdateOperationsInput';

@TypeGraphQL.InputType('SubscriptionOnAccountUpdateWithoutSubscriptionInput', {
  isAbstract: true,
})
export class SubscriptionOnAccountUpdateWithoutSubscriptionInput {
  @TypeGraphQL.Field((_type) => BoolFieldUpdateOperationsInput, {
    nullable: true,
  })
  active?: BoolFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableDateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  deactivated?: NullableDateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableDateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  activated?: NullableDateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableDateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  startedAt?: NullableDateTimeFieldUpdateOperationsInput | undefined;

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
    (_type) => AccountUpdateOneRequiredWithoutSubscriptionInput,
    {
      nullable: true,
    }
  )
  account?: AccountUpdateOneRequiredWithoutSubscriptionInput | undefined;
}
