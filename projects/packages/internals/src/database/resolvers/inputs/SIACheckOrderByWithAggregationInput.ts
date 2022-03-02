import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SIACheckAvgOrderByAggregateInput } from '../inputs/SIACheckAvgOrderByAggregateInput';
import { SIACheckCountOrderByAggregateInput } from '../inputs/SIACheckCountOrderByAggregateInput';
import { SIACheckMaxOrderByAggregateInput } from '../inputs/SIACheckMaxOrderByAggregateInput';
import { SIACheckMinOrderByAggregateInput } from '../inputs/SIACheckMinOrderByAggregateInput';
import { SIACheckSumOrderByAggregateInput } from '../inputs/SIACheckSumOrderByAggregateInput';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('SIACheckOrderByWithAggregationInput', {
  isAbstract: true,
})
export class SIACheckOrderByWithAggregationInput {
  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  id?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  sia_id?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  status?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  AuthUrl?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  pubUrl?: 'asc' | 'desc' | undefined;

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
  error?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  transactionId?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SIACheckCountOrderByAggregateInput, {
    nullable: true,
  })
  _count?: SIACheckCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => SIACheckAvgOrderByAggregateInput, {
    nullable: true,
  })
  _avg?: SIACheckAvgOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => SIACheckMaxOrderByAggregateInput, {
    nullable: true,
  })
  _max?: SIACheckMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => SIACheckMinOrderByAggregateInput, {
    nullable: true,
  })
  _min?: SIACheckMinOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => SIACheckSumOrderByAggregateInput, {
    nullable: true,
  })
  _sum?: SIACheckSumOrderByAggregateInput | undefined;
}
