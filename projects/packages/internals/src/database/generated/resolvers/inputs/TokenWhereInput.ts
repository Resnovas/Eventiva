import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountRelationFilter } from "../inputs/AccountRelationFilter";
import { BoolNullableFilter } from "../inputs/BoolNullableFilter";
import { DateTimeFilter } from "../inputs/DateTimeFilter";
import { DateTimeNullableFilter } from "../inputs/DateTimeNullableFilter";
import { EnumTokenTypeFilter } from "../inputs/EnumTokenTypeFilter";
import { StringFilter } from "../inputs/StringFilter";
import { StringNullableFilter } from "../inputs/StringNullableFilter";

@TypeGraphQL.InputType("TokenWhereInput", {
  isAbstract: true
})
export class TokenWhereInput {
  @TypeGraphQL.Field(_type => [TokenWhereInput], {
    nullable: true
  })
  AND?: TokenWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [TokenWhereInput], {
    nullable: true
  })
  OR?: TokenWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [TokenWhereInput], {
    nullable: true
  })
  NOT?: TokenWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  id?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  nickname?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeFilter, {
    nullable: true
  })
  createdAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeFilter, {
    nullable: true
  })
  updatedAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field(_type => EnumTokenTypeFilter, {
    nullable: true
  })
  type?: EnumTokenTypeFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  value?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeFilter, {
    nullable: true
  })
  expiry?: DateTimeFilter | undefined;

  @TypeGraphQL.Field(_type => AccountRelationFilter, {
    nullable: true
  })
  account?: AccountRelationFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  accountID?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeNullableFilter, {
    nullable: true
  })
  deletedDate?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field(_type => BoolNullableFilter, {
    nullable: true
  })
  deleted?: BoolNullableFilter | undefined;
}
