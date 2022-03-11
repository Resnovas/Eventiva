import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DateTimeNullableWithAggregatesFilter } from "../inputs/DateTimeNullableWithAggregatesFilter";
import { DateTimeWithAggregatesFilter } from "../inputs/DateTimeWithAggregatesFilter";
import { StringWithAggregatesFilter } from "../inputs/StringWithAggregatesFilter";

@TypeGraphQL.InputType("ApplicationScalarWhereWithAggregatesInput", {
  isAbstract: true
})
export class ApplicationScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field(_type => [ApplicationScalarWhereWithAggregatesInput], {
    nullable: true
  })
  AND?: ApplicationScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [ApplicationScalarWhereWithAggregatesInput], {
    nullable: true
  })
  OR?: ApplicationScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [ApplicationScalarWhereWithAggregatesInput], {
    nullable: true
  })
  NOT?: ApplicationScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  id?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  name?: StringWithAggregatesFilter | undefined;

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
  deleted?: DateTimeNullableWithAggregatesFilter | undefined;
}
