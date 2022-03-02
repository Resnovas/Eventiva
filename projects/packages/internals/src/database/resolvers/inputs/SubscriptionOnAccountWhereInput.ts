import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountRelationFilter } from '../inputs/AccountRelationFilter';
import { BoolFilter } from '../inputs/BoolFilter';
import { DateTimeFilter } from '../inputs/DateTimeFilter';
import { DateTimeNullableFilter } from '../inputs/DateTimeNullableFilter';
import { StringFilter } from '../inputs/StringFilter';
import { SubscriptionRelationFilter } from '../inputs/SubscriptionRelationFilter';

@TypeGraphQL.InputType('SubscriptionOnAccountWhereInput', {
  isAbstract: true,
})
export class SubscriptionOnAccountWhereInput {
  @TypeGraphQL.Field((_type) => [SubscriptionOnAccountWhereInput], {
    nullable: true,
  })
  AND?: SubscriptionOnAccountWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [SubscriptionOnAccountWhereInput], {
    nullable: true,
  })
  OR?: SubscriptionOnAccountWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [SubscriptionOnAccountWhereInput], {
    nullable: true,
  })
  NOT?: SubscriptionOnAccountWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  subscriptionId?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => SubscriptionRelationFilter, {
    nullable: true,
  })
  subscription?: SubscriptionRelationFilter | undefined;

  @TypeGraphQL.Field((_type) => AccountRelationFilter, {
    nullable: true,
  })
  account?: AccountRelationFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  accountId?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => BoolFilter, {
    nullable: true,
  })
  active?: BoolFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeNullableFilter, {
    nullable: true,
  })
  deactivated?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeNullableFilter, {
    nullable: true,
  })
  activated?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeNullableFilter, {
    nullable: true,
  })
  startedAt?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFilter, {
    nullable: true,
  })
  createdAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFilter, {
    nullable: true,
  })
  updatedAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeNullableFilter, {
    nullable: true,
  })
  deleted?: DateTimeNullableFilter | undefined;
}
