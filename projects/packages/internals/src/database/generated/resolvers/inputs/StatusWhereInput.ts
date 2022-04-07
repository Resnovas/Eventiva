import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { BoolNullableFilter } from "../inputs/BoolNullableFilter";
import { DateTimeFilter } from "../inputs/DateTimeFilter";
import { DateTimeNullableFilter } from "../inputs/DateTimeNullableFilter";
import { StatusOnAccountListRelationFilter } from "../inputs/StatusOnAccountListRelationFilter";
import { StringFilter } from "../inputs/StringFilter";

@TypeGraphQL.InputType("StatusWhereInput", {
  isAbstract: true
})
export class StatusWhereInput {
  @TypeGraphQL.Field(_type => [StatusWhereInput], {
    nullable: true
  })
  AND?: StatusWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [StatusWhereInput], {
    nullable: true
  })
  OR?: StatusWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [StatusWhereInput], {
    nullable: true
  })
  NOT?: StatusWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  id?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  name?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => StatusOnAccountListRelationFilter, {
    nullable: true
  })
  account?: StatusOnAccountListRelationFilter | undefined;

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
