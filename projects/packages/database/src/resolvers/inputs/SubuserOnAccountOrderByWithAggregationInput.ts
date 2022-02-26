import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SubuserOnAccountCountOrderByAggregateInput } from '../inputs/SubuserOnAccountCountOrderByAggregateInput';
import { SubuserOnAccountMaxOrderByAggregateInput } from '../inputs/SubuserOnAccountMaxOrderByAggregateInput';
import { SubuserOnAccountMinOrderByAggregateInput } from '../inputs/SubuserOnAccountMinOrderByAggregateInput';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('SubuserOnAccountOrderByWithAggregationInput', {
  isAbstract: true,
})
export class SubuserOnAccountOrderByWithAggregationInput {
  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  accountId?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  subuserId?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  createdAt?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  updatedAt?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SubuserOnAccountCountOrderByAggregateInput, {
    nullable: true,
  })
  _count?: SubuserOnAccountCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => SubuserOnAccountMaxOrderByAggregateInput, {
    nullable: true,
  })
  _max?: SubuserOnAccountMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => SubuserOnAccountMinOrderByAggregateInput, {
    nullable: true,
  })
  _min?: SubuserOnAccountMinOrderByAggregateInput | undefined;
}
