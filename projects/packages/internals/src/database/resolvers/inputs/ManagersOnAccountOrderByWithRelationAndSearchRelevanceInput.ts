import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountOrderByWithRelationAndSearchRelevanceInput } from '../inputs/AccountOrderByWithRelationAndSearchRelevanceInput';
import { ManagersOnAccountOrderByRelevanceInput } from '../inputs/ManagersOnAccountOrderByRelevanceInput';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType(
  'ManagersOnAccountOrderByWithRelationAndSearchRelevanceInput',
  {
    isAbstract: true,
  }
)
export class ManagersOnAccountOrderByWithRelationAndSearchRelevanceInput {
  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  accountId?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  managersId?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field(
    (_type) => AccountOrderByWithRelationAndSearchRelevanceInput,
    {
      nullable: true,
    }
  )
  account?: AccountOrderByWithRelationAndSearchRelevanceInput | undefined;

  @TypeGraphQL.Field(
    (_type) => AccountOrderByWithRelationAndSearchRelevanceInput,
    {
      nullable: true,
    }
  )
  managers?: AccountOrderByWithRelationAndSearchRelevanceInput | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  createdAt?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  updatedAt?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => ManagersOnAccountOrderByRelevanceInput, {
    nullable: true,
  })
  _relevance?: ManagersOnAccountOrderByRelevanceInput | undefined;
}
