import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SubscriptionOnAccountCreateWithoutSubscriptionInput } from '../inputs/SubscriptionOnAccountCreateWithoutSubscriptionInput';
import { SubscriptionOnAccountWhereUniqueInput } from '../inputs/SubscriptionOnAccountWhereUniqueInput';

@TypeGraphQL.InputType(
  'SubscriptionOnAccountCreateOrConnectWithoutSubscriptionInput',
  {
    isAbstract: true,
  }
)
export class SubscriptionOnAccountCreateOrConnectWithoutSubscriptionInput {
  @TypeGraphQL.Field((_type) => SubscriptionOnAccountWhereUniqueInput, {
    nullable: false,
  })
  where!: SubscriptionOnAccountWhereUniqueInput;

  @TypeGraphQL.Field(
    (_type) => SubscriptionOnAccountCreateWithoutSubscriptionInput,
    {
      nullable: false,
    }
  )
  create!: SubscriptionOnAccountCreateWithoutSubscriptionInput;
}
