import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SubscriptionOnAccountCreateWithoutAccountInput } from '../inputs/SubscriptionOnAccountCreateWithoutAccountInput';
import { SubscriptionOnAccountUpdateWithoutAccountInput } from '../inputs/SubscriptionOnAccountUpdateWithoutAccountInput';
import { SubscriptionOnAccountWhereUniqueInput } from '../inputs/SubscriptionOnAccountWhereUniqueInput';

@TypeGraphQL.InputType(
  'SubscriptionOnAccountUpsertWithWhereUniqueWithoutAccountInput',
  {
    isAbstract: true,
  }
)
export class SubscriptionOnAccountUpsertWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field((_type) => SubscriptionOnAccountWhereUniqueInput, {
    nullable: false,
  })
  where!: SubscriptionOnAccountWhereUniqueInput;

  @TypeGraphQL.Field(
    (_type) => SubscriptionOnAccountUpdateWithoutAccountInput,
    {
      nullable: false,
    }
  )
  update!: SubscriptionOnAccountUpdateWithoutAccountInput;

  @TypeGraphQL.Field(
    (_type) => SubscriptionOnAccountCreateWithoutAccountInput,
    {
      nullable: false,
    }
  )
  create!: SubscriptionOnAccountCreateWithoutAccountInput;
}
