import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountOrderByWithRelationAndSearchRelevanceInput } from '../inputs/AccountOrderByWithRelationAndSearchRelevanceInput';
import { SIACheckOrderByRelationAggregateInput } from '../inputs/SIACheckOrderByRelationAggregateInput';
import { TransactionOrderByRelevanceInput } from '../inputs/TransactionOrderByRelevanceInput';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType(
  'TransactionOrderByWithRelationAndSearchRelevanceInput',
  {
    isAbstract: true,
  }
)
export class TransactionOrderByWithRelationAndSearchRelevanceInput {
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

  @TypeGraphQL.Field(
    (_type) => AccountOrderByWithRelationAndSearchRelevanceInput,
    {
      nullable: true,
    }
  )
  account?: AccountOrderByWithRelationAndSearchRelevanceInput | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  accountId?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SIACheckOrderByRelationAggregateInput, {
    nullable: true,
  })
  SIACheck?: SIACheckOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  data?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => TransactionOrderByRelevanceInput, {
    nullable: true,
  })
  _relevance?: TransactionOrderByRelevanceInput | undefined;
}
