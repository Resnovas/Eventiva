import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateWithoutRtwInput } from '../inputs/AccountCreateWithoutRtwInput';
import { AccountUpdateWithoutRtwInput } from '../inputs/AccountUpdateWithoutRtwInput';

@TypeGraphQL.InputType('AccountUpsertWithoutRtwInput', {
  isAbstract: true,
})
export class AccountUpsertWithoutRtwInput {
  @TypeGraphQL.Field((_type) => AccountUpdateWithoutRtwInput, {
    nullable: false,
  })
  update!: AccountUpdateWithoutRtwInput;

  @TypeGraphQL.Field((_type) => AccountCreateWithoutRtwInput, {
    nullable: false,
  })
  create!: AccountCreateWithoutRtwInput;
}
