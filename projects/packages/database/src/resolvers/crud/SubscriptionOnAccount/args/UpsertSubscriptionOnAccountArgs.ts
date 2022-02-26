import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { SubscriptionOnAccountCreateInput } from '../../../inputs/SubscriptionOnAccountCreateInput';
import { SubscriptionOnAccountUpdateInput } from '../../../inputs/SubscriptionOnAccountUpdateInput';
import { SubscriptionOnAccountWhereUniqueInput } from '../../../inputs/SubscriptionOnAccountWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpsertSubscriptionOnAccountArgs {
  @TypeGraphQL.Field((_type) => SubscriptionOnAccountWhereUniqueInput, {
    nullable: false,
  })
  where!: SubscriptionOnAccountWhereUniqueInput;

  @TypeGraphQL.Field((_type) => SubscriptionOnAccountCreateInput, {
    nullable: false,
  })
  create!: SubscriptionOnAccountCreateInput;

  @TypeGraphQL.Field((_type) => SubscriptionOnAccountUpdateInput, {
    nullable: false,
  })
  update!: SubscriptionOnAccountUpdateInput;
}
