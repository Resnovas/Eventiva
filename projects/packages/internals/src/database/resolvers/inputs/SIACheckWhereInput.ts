import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DateTimeFilter } from "../inputs/DateTimeFilter";
import { DateTimeNullableFilter } from "../inputs/DateTimeNullableFilter";
import { EnumBadgeStatusFilter } from "../inputs/EnumBadgeStatusFilter";
import { IntNullableFilter } from "../inputs/IntNullableFilter";
import { SIABadgeRelationFilter } from "../inputs/SIABadgeRelationFilter";
import { StringFilter } from "../inputs/StringFilter";
import { StringNullableFilter } from "../inputs/StringNullableFilter";
import { TransactionRelationFilter } from "../inputs/TransactionRelationFilter";

@TypeGraphQL.InputType("SIACheckWhereInput", {
  isAbstract: true
})
export class SIACheckWhereInput {
  @TypeGraphQL.Field(_type => [SIACheckWhereInput], {
    nullable: true
  })
  AND?: SIACheckWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [SIACheckWhereInput], {
    nullable: true
  })
  OR?: SIACheckWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [SIACheckWhereInput], {
    nullable: true
  })
  NOT?: SIACheckWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  id?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => SIABadgeRelationFilter, {
    nullable: true
  })
  badge?: SIABadgeRelationFilter | undefined;

  @TypeGraphQL.Field(_type => IntNullableFilter, {
    nullable: true
  })
  sia_id?: IntNullableFilter | undefined;

  @TypeGraphQL.Field(_type => EnumBadgeStatusFilter, {
    nullable: true
  })
  status?: EnumBadgeStatusFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  AuthUrl?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  pubUrl?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeFilter, {
    nullable: true
  })
  createdAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeFilter, {
    nullable: true
  })
  updatedAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeNullableFilter, {
    nullable: true
  })
  deleted?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  error?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => TransactionRelationFilter, {
    nullable: true
  })
  transactions?: TransactionRelationFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  transactionId?: StringNullableFilter | undefined;
}
