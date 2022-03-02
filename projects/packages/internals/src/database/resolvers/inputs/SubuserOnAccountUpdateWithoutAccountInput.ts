import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountUpdateOneRequiredWithoutSubusersInput } from '../inputs/AccountUpdateOneRequiredWithoutSubusersInput';
import { DateTimeFieldUpdateOperationsInput } from '../inputs/DateTimeFieldUpdateOperationsInput';

@TypeGraphQL.InputType('SubuserOnAccountUpdateWithoutAccountInput', {
  isAbstract: true,
})
export class SubuserOnAccountUpdateWithoutAccountInput {
  @TypeGraphQL.Field((_type) => DateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  createdAt?: DateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  updatedAt?: DateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => AccountUpdateOneRequiredWithoutSubusersInput, {
    nullable: true,
  })
  subuser?: AccountUpdateOneRequiredWithoutSubusersInput | undefined;
}
