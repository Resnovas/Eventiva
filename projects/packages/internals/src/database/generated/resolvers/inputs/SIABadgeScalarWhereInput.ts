import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { BoolNullableFilter } from "../inputs/BoolNullableFilter";
import { DateTimeFilter } from "../inputs/DateTimeFilter";
import { DateTimeNullableFilter } from "../inputs/DateTimeNullableFilter";
import { EnumLicenseSectorFilter } from "../inputs/EnumLicenseSectorFilter";
import { EnumLicenseTypeFilter } from "../inputs/EnumLicenseTypeFilter";
import { IntFilter } from "../inputs/IntFilter";
import { StringFilter } from "../inputs/StringFilter";
import { StringNullableFilter } from "../inputs/StringNullableFilter";

@TypeGraphQL.InputType("SIABadgeScalarWhereInput", {
  isAbstract: true
})
export class SIABadgeScalarWhereInput {
  @TypeGraphQL.Field(_type => [SIABadgeScalarWhereInput], {
    nullable: true
  })
  AND?: SIABadgeScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [SIABadgeScalarWhereInput], {
    nullable: true
  })
  OR?: SIABadgeScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [SIABadgeScalarWhereInput], {
    nullable: true
  })
  NOT?: SIABadgeScalarWhereInput[] | undefined;

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
  deletedDate?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field(_type => BoolNullableFilter, {
    nullable: true
  })
  deleted?: BoolNullableFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  account_id?: StringNullableFilter | undefined;
}
