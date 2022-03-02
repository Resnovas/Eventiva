import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateWithoutAccountsInput } from '../inputs/AccountCreateWithoutAccountsInput';
import { AccountUpdateWithoutAccountsInput } from '../inputs/AccountUpdateWithoutAccountsInput';

@TypeGraphQL.InputType('AccountUpsertWithoutAccountsInput', {
  isAbstract: true,
})
export class AccountUpsertWithoutAccountsInput {
  @TypeGraphQL.Field((_type) => AccountUpdateWithoutAccountsInput, {
    nullable: false,
  })
  update!: AccountUpdateWithoutAccountsInput;

  @TypeGraphQL.Field((_type) => AccountCreateWithoutAccountsInput, {
    nullable: false,
  })
  create!: AccountCreateWithoutAccountsInput;
}
