import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DateTimeNullableWithAggregatesFilter } from "../inputs/DateTimeNullableWithAggregatesFilter";
import { DateTimeWithAggregatesFilter } from "../inputs/DateTimeWithAggregatesFilter";
import { EnumBadgeStatusWithAggregatesFilter } from "../inputs/EnumBadgeStatusWithAggregatesFilter";
import { IntNullableWithAggregatesFilter } from "../inputs/IntNullableWithAggregatesFilter";
import { StringNullableWithAggregatesFilter } from "../inputs/StringNullableWithAggregatesFilter";
import { StringWithAggregatesFilter } from "../inputs/StringWithAggregatesFilter";

@TypeGraphQL.InputType("SIACheckScalarWhereWithAggregatesInput", {
  isAbstract: true
})
export class SIACheckScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field(_type => [SIACheckScalarWhereWithAggregatesInput], {
    nullable: true
  })
  AND?: SIACheckScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [SIACheckScalarWhereWithAggregatesInput], {
    nullable: true
  })
  OR?: SIACheckScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [SIACheckScalarWhereWithAggregatesInput], {
    nullable: true
  })
  NOT?: SIACheckScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  id?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => IntNullableWithAggregatesFilter, {
    nullable: true
  })
  sia_id?: IntNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => EnumBadgeStatusWithAggregatesFilter, {
    nullable: true
  })
  status?: EnumBadgeStatusWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableWithAggregatesFilter, {
    nullable: true
  })
  AuthUrl?: StringNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableWithAggregatesFilter, {
    nullable: true
  })
  pubUrl?: StringNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeWithAggregatesFilter, {
    nullable: true
  })
  createdAt?: DateTimeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeWithAggregatesFilter, {
    nullable: true
  })
  updatedAt?: DateTimeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeNullableWithAggregatesFilter, {
    nullable: true
  })
  deleted?: DateTimeNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableWithAggregatesFilter, {
    nullable: true
  })
  error?: StringNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableWithAggregatesFilter, {
    nullable: true
  })
  transactionId?: StringNullableWithAggregatesFilter | undefined;
}
