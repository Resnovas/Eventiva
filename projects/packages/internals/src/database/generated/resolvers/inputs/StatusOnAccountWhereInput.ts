import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountRelationFilter } from "../inputs/AccountRelationFilter";
import { BoolNullableFilter } from "../inputs/BoolNullableFilter";
import { DateTimeFilter } from "../inputs/DateTimeFilter";
import { DateTimeNullableFilter } from "../inputs/DateTimeNullableFilter";
import { StatusRelationFilter } from "../inputs/StatusRelationFilter";
import { StringFilter } from "../inputs/StringFilter";

@TypeGraphQL.InputType("StatusOnAccountWhereInput", {
  isAbstract: true
})
export class StatusOnAccountWhereInput {
  @TypeGraphQL.Field(_type => [StatusOnAccountWhereInput], {
    nullable: true
  })
  AND?: StatusOnAccountWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [StatusOnAccountWhereInput], {
    nullable: true
  })
  OR?: StatusOnAccountWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [StatusOnAccountWhereInput], {
    nullable: true
  })
  NOT?: StatusOnAccountWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  statusId?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  accountId?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => StatusRelationFilter, {
    nullable: true
  })
  status?: StatusRelationFilter | undefined;

  @TypeGraphQL.Field(_type => AccountRelationFilter, {
    nullable: true
  })
  account?: AccountRelationFilter | undefined;

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
}
