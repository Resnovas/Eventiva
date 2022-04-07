import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { BoolNullableWithAggregatesFilter } from "../inputs/BoolNullableWithAggregatesFilter";
import { DateTimeNullableWithAggregatesFilter } from "../inputs/DateTimeNullableWithAggregatesFilter";
import { DateTimeWithAggregatesFilter } from "../inputs/DateTimeWithAggregatesFilter";
import { StringWithAggregatesFilter } from "../inputs/StringWithAggregatesFilter";

@TypeGraphQL.InputType("StatusOnAccountScalarWhereWithAggregatesInput", {
  isAbstract: true
})
export class StatusOnAccountScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field(_type => [StatusOnAccountScalarWhereWithAggregatesInput], {
    nullable: true
  })
  AND?: StatusOnAccountScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [StatusOnAccountScalarWhereWithAggregatesInput], {
    nullable: true
  })
  OR?: StatusOnAccountScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [StatusOnAccountScalarWhereWithAggregatesInput], {
    nullable: true
  })
  NOT?: StatusOnAccountScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  statusId?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  accountId?: StringWithAggregatesFilter | undefined;

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
  deletedDate?: DateTimeNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => BoolNullableWithAggregatesFilter, {
    nullable: true
  })
  deleted?: BoolNullableWithAggregatesFilter | undefined;
}
