import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateWithoutApiTokenInput } from '../inputs/AccountCreateWithoutApiTokenInput';
import { AccountUpdateWithoutApiTokenInput } from '../inputs/AccountUpdateWithoutApiTokenInput';

@TypeGraphQL.InputType('AccountUpsertWithoutApiTokenInput', {
  isAbstract: true,
})
export class AccountUpsertWithoutApiTokenInput {
  @TypeGraphQL.Field((_type) => AccountUpdateWithoutApiTokenInput, {
    nullable: false,
  })
  update!: AccountUpdateWithoutApiTokenInput;

  @TypeGraphQL.Field((_type) => AccountCreateWithoutApiTokenInput, {
    nullable: false,
  })
  create!: AccountCreateWithoutApiTokenInput;
}
