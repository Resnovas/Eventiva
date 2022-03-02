import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { NestedEnumTokenTypeFilter } from '../inputs/NestedEnumTokenTypeFilter';
import { NestedIntFilter } from '../inputs/NestedIntFilter';
import { TokenType } from '../../enums/TokenType';

@TypeGraphQL.InputType('NestedEnumTokenTypeWithAggregatesFilter', {
  isAbstract: true,
})
export class NestedEnumTokenTypeWithAggregatesFilter {
  @TypeGraphQL.Field((_type) => TokenType, {
    nullable: true,
  })
  equals?: 'API' | 'PERSONAL' | 'SYSTEM' | undefined;

  @TypeGraphQL.Field((_type) => [TokenType], {
    nullable: true,
  })
  in?: Array<'API' | 'PERSONAL' | 'SYSTEM'> | undefined;

  @TypeGraphQL.Field((_type) => [TokenType], {
    nullable: true,
  })
  notIn?: Array<'API' | 'PERSONAL' | 'SYSTEM'> | undefined;

  @TypeGraphQL.Field((_type) => NestedEnumTokenTypeWithAggregatesFilter, {
    nullable: true,
  })
  not?: NestedEnumTokenTypeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedIntFilter, {
    nullable: true,
  })
  _count?: NestedIntFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedEnumTokenTypeFilter, {
    nullable: true,
  })
  _min?: NestedEnumTokenTypeFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedEnumTokenTypeFilter, {
    nullable: true,
  })
  _max?: NestedEnumTokenTypeFilter | undefined;
}
