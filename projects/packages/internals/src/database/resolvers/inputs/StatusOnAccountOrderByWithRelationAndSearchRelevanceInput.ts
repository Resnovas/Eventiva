import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountOrderByWithRelationAndSearchRelevanceInput } from '../inputs/AccountOrderByWithRelationAndSearchRelevanceInput';
import { StatusOnAccountOrderByRelevanceInput } from '../inputs/StatusOnAccountOrderByRelevanceInput';
import { StatusOrderByWithRelationAndSearchRelevanceInput } from '../inputs/StatusOrderByWithRelationAndSearchRelevanceInput';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType(
  'StatusOnAccountOrderByWithRelationAndSearchRelevanceInput',
  {
    isAbstract: true,
  }
)
export class StatusOnAccountOrderByWithRelationAndSearchRelevanceInput {
  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  statusId?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  accountId?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field(
    (_type) => StatusOrderByWithRelationAndSearchRelevanceInput,
    {
      nullable: true,
    }
  )
  status?: StatusOrderByWithRelationAndSearchRelevanceInput | undefined;

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
  createdAt?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  updatedAt?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  deleted?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => StatusOnAccountOrderByRelevanceInput, {
    nullable: true,
  })
  _relevance?: StatusOnAccountOrderByRelevanceInput | undefined;
}
