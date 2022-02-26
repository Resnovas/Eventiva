import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ArrangementOfRoomOrderByRelevanceInput } from '../inputs/ArrangementOfRoomOrderByRelevanceInput';
import { ArrangementOrderByWithRelationAndSearchRelevanceInput } from '../inputs/ArrangementOrderByWithRelationAndSearchRelevanceInput';
import { RoomOrderByWithRelationAndSearchRelevanceInput } from '../inputs/RoomOrderByWithRelationAndSearchRelevanceInput';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType(
  'ArrangementOfRoomOrderByWithRelationAndSearchRelevanceInput',
  {
    isAbstract: true,
  }
)
export class ArrangementOfRoomOrderByWithRelationAndSearchRelevanceInput {
  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  roomId?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  arrangementId?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field(
    (_type) => ArrangementOrderByWithRelationAndSearchRelevanceInput,
    {
      nullable: true,
    }
  )
  arrangement?:
    | ArrangementOrderByWithRelationAndSearchRelevanceInput
    | undefined;

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
  capacity?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  details?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  createdAt?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  updatedAt?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => ArrangementOfRoomOrderByRelevanceInput, {
    nullable: true,
  })
  _relevance?: ArrangementOfRoomOrderByRelevanceInput | undefined;
}
