import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { SubscriptionOnAccountCreateInput } from '../../../inputs/SubscriptionOnAccountCreateInput';

@TypeGraphQL.ArgsType()
export class CreateSubscriptionOnAccountArgs {
  @TypeGraphQL.Field((_type) => SubscriptionOnAccountCreateInput, {
    nullable: false,
  })
  data!: SubscriptionOnAccountCreateInput;
}
