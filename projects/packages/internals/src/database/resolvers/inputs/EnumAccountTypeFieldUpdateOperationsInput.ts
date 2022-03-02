import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountType } from '../../enums/AccountType';

@TypeGraphQL.InputType('EnumAccountTypeFieldUpdateOperationsInput', {
  isAbstract: true,
})
export class EnumAccountTypeFieldUpdateOperationsInput {
  @TypeGraphQL.Field((_type) => AccountType, {
    nullable: true,
  })
  set?: 'USER' | 'BUSINESS' | 'PROVIDER' | undefined;
}
