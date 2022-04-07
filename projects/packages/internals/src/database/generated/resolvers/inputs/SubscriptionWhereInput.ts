import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { BoolNullableFilter } from "../inputs/BoolNullableFilter";
import { DateTimeFilter } from "../inputs/DateTimeFilter";
import { DateTimeNullableFilter } from "../inputs/DateTimeNullableFilter";
import { StringFilter } from "../inputs/StringFilter";
import { StringNullableFilter } from "../inputs/StringNullableFilter";
import { SubscriptionOnAccountListRelationFilter } from "../inputs/SubscriptionOnAccountListRelationFilter";

@TypeGraphQL.InputType("SubscriptionWhereInput", {
  isAbstract: true
})
export class SubscriptionWhereInput {
  @TypeGraphQL.Field(_type => [SubscriptionWhereInput], {
    nullable: true
  })
  AND?: SubscriptionWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [SubscriptionWhereInput], {
    nullable: true
  })
  OR?: SubscriptionWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [SubscriptionWhereInput], {
    nullable: true
  })
  NOT?: SubscriptionWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  id?: StringFilter | undefined;

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
  name?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  cost?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  details?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => SubscriptionOnAccountListRelationFilter, {
    nullable: true
  })
  accounts?: SubscriptionOnAccountListRelationFilter | undefined;
}
