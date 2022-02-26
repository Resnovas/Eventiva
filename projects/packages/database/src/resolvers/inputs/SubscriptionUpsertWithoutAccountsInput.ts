import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SubscriptionCreateWithoutAccountsInput } from '../inputs/SubscriptionCreateWithoutAccountsInput';
import { SubscriptionUpdateWithoutAccountsInput } from '../inputs/SubscriptionUpdateWithoutAccountsInput';

@TypeGraphQL.InputType('SubscriptionUpsertWithoutAccountsInput', {
  isAbstract: true,
})
export class SubscriptionUpsertWithoutAccountsInput {
  @TypeGraphQL.Field((_type) => SubscriptionUpdateWithoutAccountsInput, {
    nullable: false,
  })
  update!: SubscriptionUpdateWithoutAccountsInput;

  @TypeGraphQL.Field((_type) => SubscriptionCreateWithoutAccountsInput, {
    nullable: false,
  })
  create!: SubscriptionCreateWithoutAccountsInput;
}
