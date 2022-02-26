import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SubscriptionOnAccountOrderByRelationAggregateInput } from '../inputs/SubscriptionOnAccountOrderByRelationAggregateInput';
import { SubscriptionOrderByRelevanceInput } from '../inputs/SubscriptionOrderByRelevanceInput';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType(
  'SubscriptionOrderByWithRelationAndSearchRelevanceInput',
  {
    isAbstract: true,
  }
)
export class SubscriptionOrderByWithRelationAndSearchRelevanceInput {
  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  id?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  createdAt?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  updatedAt?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  deleted?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  name?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  cost?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  details?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field(
    (_type) => SubscriptionOnAccountOrderByRelationAggregateInput,
    {
      nullable: true,
    }
  )
  accounts?: SubscriptionOnAccountOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => SubscriptionOrderByRelevanceInput, {
    nullable: true,
  })
  _relevance?: SubscriptionOrderByRelevanceInput | undefined;
}
