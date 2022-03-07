import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateWithoutEmailsInput } from '../inputs/AccountCreateWithoutEmailsInput';
import { AccountUpdateWithoutEmailsInput } from '../inputs/AccountUpdateWithoutEmailsInput';

@TypeGraphQL.InputType('AccountUpsertWithoutEmailsInput', {
  isAbstract: true,
})
export class AccountUpsertWithoutEmailsInput {
  @TypeGraphQL.Field((_type) => AccountUpdateWithoutEmailsInput, {
    nullable: false,
  })
  update!: AccountUpdateWithoutEmailsInput;

  @TypeGraphQL.Field((_type) => AccountCreateWithoutEmailsInput, {
    nullable: false,
  })
  create!: AccountCreateWithoutEmailsInput;
}
