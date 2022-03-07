import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountOrderByWithRelationAndSearchRelevanceInput } from '../inputs/AccountOrderByWithRelationAndSearchRelevanceInput';
import { SubuserOnAccountOrderByRelevanceInput } from '../inputs/SubuserOnAccountOrderByRelevanceInput';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType(
  'SubuserOnAccountOrderByWithRelationAndSearchRelevanceInput',
  {
    isAbstract: true,
  }
)
export class SubuserOnAccountOrderByWithRelationAndSearchRelevanceInput {
  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  accountId?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  subuserId?: 'asc' | 'desc' | undefined;

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
  subuser?: AccountOrderByWithRelationAndSearchRelevanceInput | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  createdAt?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  updatedAt?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SubuserOnAccountOrderByRelevanceInput, {
    nullable: true,
  })
  _relevance?: SubuserOnAccountOrderByRelevanceInput | undefined;
}
