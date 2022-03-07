import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureOfRoomOrderByRelevanceInput } from '../inputs/FeatureOfRoomOrderByRelevanceInput';
import { FeatureOrderByWithRelationAndSearchRelevanceInput } from '../inputs/FeatureOrderByWithRelationAndSearchRelevanceInput';
import { RoomOrderByWithRelationAndSearchRelevanceInput } from '../inputs/RoomOrderByWithRelationAndSearchRelevanceInput';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType(
  'FeatureOfRoomOrderByWithRelationAndSearchRelevanceInput',
  {
    isAbstract: true,
  }
)
export class FeatureOfRoomOrderByWithRelationAndSearchRelevanceInput {
  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  roomId?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  featureId?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field(
    (_type) => FeatureOrderByWithRelationAndSearchRelevanceInput,
    {
      nullable: true,
    }
  )
  feature?: FeatureOrderByWithRelationAndSearchRelevanceInput | undefined;

  @TypeGraphQL.Field(
    (_type) => RoomOrderByWithRelationAndSearchRelevanceInput,
    {
      nullable: true,
    }
  )
  room?: RoomOrderByWithRelationAndSearchRelevanceInput | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  data?: 'asc' | 'desc' | undefined;

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

  @TypeGraphQL.Field((_type) => FeatureOfRoomOrderByRelevanceInput, {
    nullable: true,
  })
  _relevance?: FeatureOfRoomOrderByRelevanceInput | undefined;
}
