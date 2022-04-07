import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountListRelationFilter } from "../inputs/AccountListRelationFilter";
import { BoolNullableFilter } from "../inputs/BoolNullableFilter";
import { DateTimeFilter } from "../inputs/DateTimeFilter";
import { DateTimeNullableFilter } from "../inputs/DateTimeNullableFilter";
import { RTWRelationFilter } from "../inputs/RTWRelationFilter";
import { StringFilter } from "../inputs/StringFilter";
import { StringNullableFilter } from "../inputs/StringNullableFilter";

@TypeGraphQL.InputType("FilesWhereInput", {
  isAbstract: true
})
export class FilesWhereInput {
  @TypeGraphQL.Field(_type => [FilesWhereInput], {
    nullable: true
  })
  AND?: FilesWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [FilesWhereInput], {
    nullable: true
  })
  OR?: FilesWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [FilesWhereInput], {
    nullable: true
  })
  NOT?: FilesWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  id?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  name?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => RTWRelationFilter, {
    nullable: true
  })
  rtw?: RTWRelationFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  rtwId?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => AccountListRelationFilter, {
    nullable: true
  })
  account?: AccountListRelationFilter | undefined;

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
