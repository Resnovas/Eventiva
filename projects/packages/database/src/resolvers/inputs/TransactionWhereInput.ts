import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountRelationFilter } from '../inputs/AccountRelationFilter';
import { DateTimeFilter } from '../inputs/DateTimeFilter';
import { DateTimeNullableFilter } from '../inputs/DateTimeNullableFilter';
import { JsonFilter } from '../inputs/JsonFilter';
import { SIACheckListRelationFilter } from '../inputs/SIACheckListRelationFilter';
import { StringFilter } from '../inputs/StringFilter';

@TypeGraphQL.InputType('TransactionWhereInput', {
  isAbstract: true,
})
export class TransactionWhereInput {
  @TypeGraphQL.Field((_type) => [TransactionWhereInput], {
    nullable: true,
  })
  AND?: TransactionWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [TransactionWhereInput], {
    nullable: true,
  })
  OR?: TransactionWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [TransactionWhereInput], {
    nullable: true,
  })
  NOT?: TransactionWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  id?: StringFilter | undefined;

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

  @TypeGraphQL.Field((_type) => AccountRelationFilter, {
    nullable: true,
  })
  account?: AccountRelationFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  accountId?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => SIACheckListRelationFilter, {
    nullable: true,
  })
  SIACheck?: SIACheckListRelationFilter | undefined;

  @TypeGraphQL.Field((_type) => JsonFilter, {
    nullable: true,
  })
  data?: JsonFilter | undefined;
}
