import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SubscriptionOnAccountCreateWithoutSubscriptionInput } from '../inputs/SubscriptionOnAccountCreateWithoutSubscriptionInput';
import { SubscriptionOnAccountUpdateWithoutSubscriptionInput } from '../inputs/SubscriptionOnAccountUpdateWithoutSubscriptionInput';
import { SubscriptionOnAccountWhereUniqueInput } from '../inputs/SubscriptionOnAccountWhereUniqueInput';

@TypeGraphQL.InputType(
  'SubscriptionOnAccountUpsertWithWhereUniqueWithoutSubscriptionInput',
  {
    isAbstract: true,
  }
)
export class SubscriptionOnAccountUpsertWithWhereUniqueWithoutSubscriptionInput {
  @TypeGraphQL.Field((_type) => SubscriptionOnAccountWhereUniqueInput, {
    nullable: false,
  })
  where!: SubscriptionOnAccountWhereUniqueInput;

  @TypeGraphQL.Field(
    (_type) => SubscriptionOnAccountUpdateWithoutSubscriptionInput,
    {
      nullable: false,
    }
  )
  update!: SubscriptionOnAccountUpdateWithoutSubscriptionInput;

  @TypeGraphQL.Field(
    (_type) => SubscriptionOnAccountCreateWithoutSubscriptionInput,
    {
      nullable: false,
    }
  )
  create!: SubscriptionOnAccountCreateWithoutSubscriptionInput;
}
