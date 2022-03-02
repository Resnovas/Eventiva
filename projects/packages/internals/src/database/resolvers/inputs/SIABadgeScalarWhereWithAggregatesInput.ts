import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DateTimeNullableWithAggregatesFilter } from '../inputs/DateTimeNullableWithAggregatesFilter';
import { DateTimeWithAggregatesFilter } from '../inputs/DateTimeWithAggregatesFilter';
import { EnumLicenseSectorWithAggregatesFilter } from '../inputs/EnumLicenseSectorWithAggregatesFilter';
import { EnumLicenseTypeWithAggregatesFilter } from '../inputs/EnumLicenseTypeWithAggregatesFilter';
import { IntWithAggregatesFilter } from '../inputs/IntWithAggregatesFilter';
import { StringNullableWithAggregatesFilter } from '../inputs/StringNullableWithAggregatesFilter';
import { StringWithAggregatesFilter } from '../inputs/StringWithAggregatesFilter';

@TypeGraphQL.InputType('SIABadgeScalarWhereWithAggregatesInput', {
  isAbstract: true,
})
export class SIABadgeScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field((_type) => [SIABadgeScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  AND?: SIABadgeScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [SIABadgeScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  OR?: SIABadgeScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [SIABadgeScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  NOT?: SIABadgeScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => IntWithAggregatesFilter, {
    nullable: true,
  })
  id?: IntWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => EnumLicenseSectorWithAggregatesFilter, {
    nullable: true,
  })
  licenseSector?: EnumLicenseSectorWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => EnumLicenseTypeWithAggregatesFilter, {
    nullable: true,
  })
  type?: EnumLicenseTypeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringWithAggregatesFilter, {
    nullable: true,
  })
  licenseExplanation?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringWithAggregatesFilter, {
    nullable: true,
  })
  additionalTerms?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeWithAggregatesFilter, {
    nullable: true,
  })
  createdAt?: DateTimeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeNullableWithAggregatesFilter, {
    nullable: true,
  })
  active?: DateTimeNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeNullableWithAggregatesFilter, {
    nullable: true,
  })
  expiry?: DateTimeNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeWithAggregatesFilter, {
    nullable: true,
  })
  updatedAt?: DateTimeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeNullableWithAggregatesFilter, {
    nullable: true,
  })
  deleted?: DateTimeNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableWithAggregatesFilter, {
    nullable: true,
  })
  account_id?: StringNullableWithAggregatesFilter | undefined;
}
