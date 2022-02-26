import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ArrangementOfRoomOrderByRelationAggregateInput } from '../inputs/ArrangementOfRoomOrderByRelationAggregateInput';
import { ArrangementOrderByRelevanceInput } from '../inputs/ArrangementOrderByRelevanceInput';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType(
  'ArrangementOrderByWithRelationAndSearchRelevanceInput',
  {
    isAbstract: true,
  }
)
export class ArrangementOrderByWithRelationAndSearchRelevanceInput {
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

  @TypeGraphQL.Field(
    (_type) => ArrangementOfRoomOrderByRelationAggregateInput,
    {
      nullable: true,
    }
  )
  room?: ArrangementOfRoomOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  name?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  icon?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  details?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => ArrangementOrderByRelevanceInput, {
    nullable: true,
  })
  _relevance?: ArrangementOrderByRelevanceInput | undefined;
}