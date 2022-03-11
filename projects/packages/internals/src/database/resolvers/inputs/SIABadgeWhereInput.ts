import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountRelationFilter } from "../inputs/AccountRelationFilter";
import { DateTimeFilter } from "../inputs/DateTimeFilter";
import { DateTimeNullableFilter } from "../inputs/DateTimeNullableFilter";
import { EnumLicenseSectorFilter } from "../inputs/EnumLicenseSectorFilter";
import { EnumLicenseTypeFilter } from "../inputs/EnumLicenseTypeFilter";
import { IntFilter } from "../inputs/IntFilter";
import { SIACheckListRelationFilter } from "../inputs/SIACheckListRelationFilter";
import { StringFilter } from "../inputs/StringFilter";
import { StringNullableFilter } from "../inputs/StringNullableFilter";

@TypeGraphQL.InputType("SIABadgeWhereInput", {
  isAbstract: true
})
export class SIABadgeWhereInput {
  @TypeGraphQL.Field(_type => [SIABadgeWhereInput], {
    nullable: true
  })
  AND?: SIABadgeWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [SIABadgeWhereInput], {
    nullable: true
  })
  OR?: SIABadgeWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [SIABadgeWhereInput], {
    nullable: true
  })
  NOT?: SIABadgeWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => IntFilter, {
    nullable: true
  })
  id?: IntFilter | undefined;

  @TypeGraphQL.Field(_type => EnumLicenseSectorFilter, {
    nullable: true
  })
  licenseSector?: EnumLicenseSectorFilter | undefined;

  @TypeGraphQL.Field(_type => EnumLicenseTypeFilter, {
    nullable: true
  })
  type?: EnumLicenseTypeFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  licenseExplanation?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  additionalTerms?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeFilter, {
    nullable: true
  })
  createdAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeNullableFilter, {
    nullable: true
  })
  active?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeNullableFilter, {
    nullable: true
  })
  expiry?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeFilter, {
    nullable: true
  })
  updatedAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeNullableFilter, {
    nullable: true
  })
  deleted?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field(_type => SIACheckListRelationFilter, {
    nullable: true
  })
  siaChecks?: SIACheckListRelationFilter | undefined;

  @TypeGraphQL.Field(_type => AccountRelationFilter, {
    nullable: true
  })
  account?: AccountRelationFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  account_id?: StringNullableFilter | undefined;
}
