import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SIABadgeCreateNestedOneWithoutSiaChecksInput } from '../inputs/SIABadgeCreateNestedOneWithoutSiaChecksInput';
import { BadgeStatus } from '../../enums/BadgeStatus';

@TypeGraphQL.InputType('SIACheckCreateWithoutTransactionsInput', {
  isAbstract: true,
})
export class SIACheckCreateWithoutTransactionsInput {
  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  id?: string | undefined;

  @TypeGraphQL.Field((_type) => BadgeStatus, {
    nullable: false,
  })
  status!: 'ACTIVE' | 'REVOKED' | 'SUSPENDED' | 'NON_ACTIVE';

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  AuthUrl?: string | undefined;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  pubUrl?: string | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  updatedAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  deleted?: Date | undefined;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  error?: string | undefined;

  @TypeGraphQL.Field((_type) => SIABadgeCreateNestedOneWithoutSiaChecksInput, {
    nullable: true,
  })
  badge?: SIABadgeCreateNestedOneWithoutSiaChecksInput | undefined;
}