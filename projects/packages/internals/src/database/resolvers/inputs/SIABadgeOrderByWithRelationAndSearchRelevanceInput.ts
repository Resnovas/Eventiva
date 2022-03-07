import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountOrderByWithRelationAndSearchRelevanceInput } from '../inputs/AccountOrderByWithRelationAndSearchRelevanceInput';
import { SIABadgeOrderByRelevanceInput } from '../inputs/SIABadgeOrderByRelevanceInput';
import { SIACheckOrderByRelationAggregateInput } from '../inputs/SIACheckOrderByRelationAggregateInput';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('SIABadgeOrderByWithRelationAndSearchRelevanceInput', {
  isAbstract: true,
})
export class SIABadgeOrderByWithRelationAndSearchRelevanceInput {
  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  id?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  licenseSector?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  type?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  licenseExplanation?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  additionalTerms?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  createdAt?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  active?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  expiry?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  updatedAt?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  deleted?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SIACheckOrderByRelationAggregateInput, {
    nullable: true,
  })
  siaChecks?: SIACheckOrderByRelationAggregateInput | undefined;

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
  account_id?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SIABadgeOrderByRelevanceInput, {
    nullable: true,
  })
  _relevance?: SIABadgeOrderByRelevanceInput | undefined;
}
