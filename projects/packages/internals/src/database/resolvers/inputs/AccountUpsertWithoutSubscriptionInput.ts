import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateWithoutSubscriptionInput } from '../inputs/AccountCreateWithoutSubscriptionInput';
import { AccountUpdateWithoutSubscriptionInput } from '../inputs/AccountUpdateWithoutSubscriptionInput';

@TypeGraphQL.InputType('AccountUpsertWithoutSubscriptionInput', {
  isAbstract: true,
})
export class AccountUpsertWithoutSubscriptionInput {
  @TypeGraphQL.Field((_type) => AccountUpdateWithoutSubscriptionInput, {
    nullable: false,
  })
  update!: AccountUpdateWithoutSubscriptionInput;

  @TypeGraphQL.Field((_type) => AccountCreateWithoutSubscriptionInput, {
    nullable: false,
  })
  create!: AccountCreateWithoutSubscriptionInput;
}
