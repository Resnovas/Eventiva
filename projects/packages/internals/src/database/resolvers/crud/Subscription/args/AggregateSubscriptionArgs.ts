import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { SubscriptionOrderByWithRelationAndSearchRelevanceInput } from '../../../inputs/SubscriptionOrderByWithRelationAndSearchRelevanceInput';
import { SubscriptionWhereInput } from '../../../inputs/SubscriptionWhereInput';
import { SubscriptionWhereUniqueInput } from '../../../inputs/SubscriptionWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class AggregateSubscriptionArgs {
  @TypeGraphQL.Field((_type) => SubscriptionWhereInput, {
    nullable: true,
  })
  where?: SubscriptionWhereInput | undefined;

  @TypeGraphQL.Field(
    (_type) => [SubscriptionOrderByWithRelationAndSearchRelevanceInput],
    {
      nullable: true,
    }
  )
  orderBy?:
    | SubscriptionOrderByWithRelationAndSearchRelevanceInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => SubscriptionWhereUniqueInput, {
    nullable: true,
  })
  cursor?: SubscriptionWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;
}
