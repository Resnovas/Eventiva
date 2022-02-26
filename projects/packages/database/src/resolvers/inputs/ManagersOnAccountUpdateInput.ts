import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountUpdateOneRequiredWithoutAccountsInput } from '../inputs/AccountUpdateOneRequiredWithoutAccountsInput';
import { AccountUpdateOneRequiredWithoutManagersInput } from '../inputs/AccountUpdateOneRequiredWithoutManagersInput';
import { DateTimeFieldUpdateOperationsInput } from '../inputs/DateTimeFieldUpdateOperationsInput';

@TypeGraphQL.InputType('ManagersOnAccountUpdateInput', {
  isAbstract: true,
})
export class ManagersOnAccountUpdateInput {
  @TypeGraphQL.Field((_type) => DateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  createdAt?: DateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  updatedAt?: DateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => AccountUpdateOneRequiredWithoutAccountsInput, {
    nullable: true,
  })
  account?: AccountUpdateOneRequiredWithoutAccountsInput | undefined;

  @TypeGraphQL.Field((_type) => AccountUpdateOneRequiredWithoutManagersInput, {
    nullable: true,
  })
  managers?: AccountUpdateOneRequiredWithoutManagersInput | undefined;
}
