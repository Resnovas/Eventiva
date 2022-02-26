import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountUpdateOneRequiredWithoutEmployerInput } from '../inputs/AccountUpdateOneRequiredWithoutEmployerInput';
import { DateTimeFieldUpdateOperationsInput } from '../inputs/DateTimeFieldUpdateOperationsInput';

@TypeGraphQL.InputType('EmployersOnAccountUpdateWithoutEmployerInput', {
  isAbstract: true,
})
export class EmployersOnAccountUpdateWithoutEmployerInput {
  @TypeGraphQL.Field((_type) => DateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  createdAt?: DateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  updatedAt?: DateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => AccountUpdateOneRequiredWithoutEmployerInput, {
    nullable: true,
  })
  account?: AccountUpdateOneRequiredWithoutEmployerInput | undefined;
}
