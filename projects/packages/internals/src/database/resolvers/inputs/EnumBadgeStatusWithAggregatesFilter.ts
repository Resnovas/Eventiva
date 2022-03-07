import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { NestedEnumBadgeStatusFilter } from '../inputs/NestedEnumBadgeStatusFilter';
import { NestedEnumBadgeStatusWithAggregatesFilter } from '../inputs/NestedEnumBadgeStatusWithAggregatesFilter';
import { NestedIntFilter } from '../inputs/NestedIntFilter';
import { BadgeStatus } from '../../enums/BadgeStatus';

@TypeGraphQL.InputType('EnumBadgeStatusWithAggregatesFilter', {
  isAbstract: true,
})
export class EnumBadgeStatusWithAggregatesFilter {
  @TypeGraphQL.Field((_type) => BadgeStatus, {
    nullable: true,
  })
  equals?: 'ACTIVE' | 'REVOKED' | 'SUSPENDED' | 'NON_ACTIVE' | undefined;

  @TypeGraphQL.Field((_type) => [BadgeStatus], {
    nullable: true,
  })
  in?: Array<'ACTIVE' | 'REVOKED' | 'SUSPENDED' | 'NON_ACTIVE'> | undefined;

  @TypeGraphQL.Field((_type) => [BadgeStatus], {
    nullable: true,
  })
  notIn?: Array<'ACTIVE' | 'REVOKED' | 'SUSPENDED' | 'NON_ACTIVE'> | undefined;

  @TypeGraphQL.Field((_type) => NestedEnumBadgeStatusWithAggregatesFilter, {
    nullable: true,
  })
  not?: NestedEnumBadgeStatusWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedIntFilter, {
    nullable: true,
  })
  _count?: NestedIntFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedEnumBadgeStatusFilter, {
    nullable: true,
  })
  _min?: NestedEnumBadgeStatusFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedEnumBadgeStatusFilter, {
    nullable: true,
  })
  _max?: NestedEnumBadgeStatusFilter | undefined;
}
