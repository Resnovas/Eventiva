import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { NestedEnumdnsTypeFilter } from '../inputs/NestedEnumdnsTypeFilter';
import { NestedEnumdnsTypeWithAggregatesFilter } from '../inputs/NestedEnumdnsTypeWithAggregatesFilter';
import { NestedIntFilter } from '../inputs/NestedIntFilter';
import { dnsType } from '../../enums/dnsType';

@TypeGraphQL.InputType('EnumdnsTypeWithAggregatesFilter', {
  isAbstract: true,
})
export class EnumdnsTypeWithAggregatesFilter {
  @TypeGraphQL.Field((_type) => dnsType, {
    nullable: true,
  })
  equals?: 'TXT' | 'CNAME' | undefined;

  @TypeGraphQL.Field((_type) => [dnsType], {
    nullable: true,
  })
  in?: Array<'TXT' | 'CNAME'> | undefined;

  @TypeGraphQL.Field((_type) => [dnsType], {
    nullable: true,
  })
  notIn?: Array<'TXT' | 'CNAME'> | undefined;

  @TypeGraphQL.Field((_type) => NestedEnumdnsTypeWithAggregatesFilter, {
    nullable: true,
  })
  not?: NestedEnumdnsTypeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedIntFilter, {
    nullable: true,
  })
  _count?: NestedIntFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedEnumdnsTypeFilter, {
    nullable: true,
  })
  _min?: NestedEnumdnsTypeFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedEnumdnsTypeFilter, {
    nullable: true,
  })
  _max?: NestedEnumdnsTypeFilter | undefined;
}
