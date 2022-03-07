import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { NestedEnumAccountTypeFilter } from '../inputs/NestedEnumAccountTypeFilter';
import { NestedEnumAccountTypeWithAggregatesFilter } from '../inputs/NestedEnumAccountTypeWithAggregatesFilter';
import { NestedIntFilter } from '../inputs/NestedIntFilter';
import { AccountType } from '../../enums/AccountType';

@TypeGraphQL.InputType('EnumAccountTypeWithAggregatesFilter', {
  isAbstract: true,
})
export class EnumAccountTypeWithAggregatesFilter {
  @TypeGraphQL.Field((_type) => AccountType, {
    nullable: true,
  })
  equals?: 'USER' | 'BUSINESS' | 'PROVIDER' | undefined;

  @TypeGraphQL.Field((_type) => [AccountType], {
    nullable: true,
  })
  in?: Array<'USER' | 'BUSINESS' | 'PROVIDER'> | undefined;

  @TypeGraphQL.Field((_type) => [AccountType], {
    nullable: true,
  })
  notIn?: Array<'USER' | 'BUSINESS' | 'PROVIDER'> | undefined;

  @TypeGraphQL.Field((_type) => NestedEnumAccountTypeWithAggregatesFilter, {
    nullable: true,
  })
  not?: NestedEnumAccountTypeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedIntFilter, {
    nullable: true,
  })
  _count?: NestedIntFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedEnumAccountTypeFilter, {
    nullable: true,
  })
  _min?: NestedEnumAccountTypeFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedEnumAccountTypeFilter, {
    nullable: true,
  })
  _max?: NestedEnumAccountTypeFilter | undefined;
}
