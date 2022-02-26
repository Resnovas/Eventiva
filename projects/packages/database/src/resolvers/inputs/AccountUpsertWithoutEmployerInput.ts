import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateWithoutEmployerInput } from '../inputs/AccountCreateWithoutEmployerInput';
import { AccountUpdateWithoutEmployerInput } from '../inputs/AccountUpdateWithoutEmployerInput';

@TypeGraphQL.InputType('AccountUpsertWithoutEmployerInput', {
  isAbstract: true,
})
export class AccountUpsertWithoutEmployerInput {
  @TypeGraphQL.Field((_type) => AccountUpdateWithoutEmployerInput, {
    nullable: false,
  })
  update!: AccountUpdateWithoutEmployerInput;

  @TypeGraphQL.Field((_type) => AccountCreateWithoutEmployerInput, {
    nullable: false,
  })
  create!: AccountCreateWithoutEmployerInput;
}
