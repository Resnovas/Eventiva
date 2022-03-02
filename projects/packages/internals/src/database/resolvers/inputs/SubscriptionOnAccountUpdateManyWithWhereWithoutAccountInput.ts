import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SubscriptionOnAccountScalarWhereInput } from '../inputs/SubscriptionOnAccountScalarWhereInput';
import { SubscriptionOnAccountUpdateManyMutationInput } from '../inputs/SubscriptionOnAccountUpdateManyMutationInput';

@TypeGraphQL.InputType(
  'SubscriptionOnAccountUpdateManyWithWhereWithoutAccountInput',
  {
    isAbstract: true,
  }
)
export class SubscriptionOnAccountUpdateManyWithWhereWithoutAccountInput {
  @TypeGraphQL.Field((_type) => SubscriptionOnAccountScalarWhereInput, {
    nullable: false,
  })
  where!: SubscriptionOnAccountScalarWhereInput;

  @TypeGraphQL.Field((_type) => SubscriptionOnAccountUpdateManyMutationInput, {
    nullable: false,
  })
  data!: SubscriptionOnAccountUpdateManyMutationInput;
}
