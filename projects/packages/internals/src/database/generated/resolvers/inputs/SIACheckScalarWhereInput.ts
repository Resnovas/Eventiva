import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { BoolNullableFilter } from "../inputs/BoolNullableFilter";
import { DateTimeFilter } from "../inputs/DateTimeFilter";
import { DateTimeNullableFilter } from "../inputs/DateTimeNullableFilter";
import { EnumBadgeStatusFilter } from "../inputs/EnumBadgeStatusFilter";
import { IntNullableFilter } from "../inputs/IntNullableFilter";
import { StringFilter } from "../inputs/StringFilter";
import { StringNullableFilter } from "../inputs/StringNullableFilter";

@TypeGraphQL.InputType("SIACheckScalarWhereInput", {
  isAbstract: true
})
export class SIACheckScalarWhereInput {
  @TypeGraphQL.Field(_type => [SIACheckScalarWhereInput], {
    nullable: true
  })
  AND?: SIACheckScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [SIACheckScalarWhereInput], {
    nullable: true
  })
  OR?: SIACheckScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [SIACheckScalarWhereInput], {
    nullable: true
  })
  NOT?: SIACheckScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  id?: StringFilter | undefined;

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
  deletedDate?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field(_type => BoolNullableFilter, {
    nullable: true
  })
  deleted?: BoolNullableFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  error?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  transactionId?: StringNullableFilter | undefined;
}
