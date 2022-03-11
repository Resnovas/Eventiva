import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ArrangementOfRoomListRelationFilter } from "../inputs/ArrangementOfRoomListRelationFilter";
import { DateTimeFilter } from "../inputs/DateTimeFilter";
import { StringFilter } from "../inputs/StringFilter";
import { StringNullableFilter } from "../inputs/StringNullableFilter";

@TypeGraphQL.InputType("ArrangementWhereInput", {
  isAbstract: true
})
export class ArrangementWhereInput {
  @TypeGraphQL.Field(_type => [ArrangementWhereInput], {
    nullable: true
  })
  AND?: ArrangementWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [ArrangementWhereInput], {
    nullable: true
  })
  OR?: ArrangementWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [ArrangementWhereInput], {
    nullable: true
  })
  NOT?: ArrangementWhereInput[] | undefined;

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

  @TypeGraphQL.Field(_type => ArrangementOfRoomListRelationFilter, {
    nullable: true
  })
  room?: ArrangementOfRoomListRelationFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  name?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  icon?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  details?: StringNullableFilter | undefined;
}
