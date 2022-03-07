import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { SubscriptionOnAccountWhereInput } from '../../../inputs/SubscriptionOnAccountWhereInput';

@TypeGraphQL.ArgsType()
export class DeleteManySubscriptionOnAccountArgs {
  @TypeGraphQL.Field((_type) => SubscriptionOnAccountWhereInput, {
    nullable: true,
  })
  where?: SubscriptionOnAccountWhereInput | undefined;
}
