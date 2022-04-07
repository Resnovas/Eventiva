import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { BoolNullableWithAggregatesFilter } from "../inputs/BoolNullableWithAggregatesFilter";
import { DateTimeNullableWithAggregatesFilter } from "../inputs/DateTimeNullableWithAggregatesFilter";
import { DateTimeWithAggregatesFilter } from "../inputs/DateTimeWithAggregatesFilter";
import { StringWithAggregatesFilter } from "../inputs/StringWithAggregatesFilter";

@TypeGraphQL.InputType("ManagersOnAccountScalarWhereWithAggregatesInput", {
  isAbstract: true
})
export class ManagersOnAccountScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field(_type => [ManagersOnAccountScalarWhereWithAggregatesInput], {
    nullable: true
  })
  AND?: ManagersOnAccountScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [ManagersOnAccountScalarWhereWithAggregatesInput], {
    nullable: true
  })
  OR?: ManagersOnAccountScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [ManagersOnAccountScalarWhereWithAggregatesInput], {
    nullable: true
  })
  NOT?: ManagersOnAccountScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  accountId?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  managersId?: StringWithAggregatesFilter | undefined;

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
