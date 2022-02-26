import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { SubscriptionUpdateManyMutationInput } from '../../../inputs/SubscriptionUpdateManyMutationInput';
import { SubscriptionWhereInput } from '../../../inputs/SubscriptionWhereInput';

@TypeGraphQL.ArgsType()
export class UpdateManySubscriptionArgs {
  @TypeGraphQL.Field((_type) => SubscriptionUpdateManyMutationInput, {
    nullable: false,
  })
  data!: SubscriptionUpdateManyMutationInput;

  @TypeGraphQL.Field((_type) => SubscriptionWhereInput, {
    nullable: true,
  })
  where?: SubscriptionWhereInput | undefined;
}
