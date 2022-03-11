import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DateTimeWithAggregatesFilter } from "../inputs/DateTimeWithAggregatesFilter";
import { IntWithAggregatesFilter } from "../inputs/IntWithAggregatesFilter";
import { StringNullableWithAggregatesFilter } from "../inputs/StringNullableWithAggregatesFilter";
import { StringWithAggregatesFilter } from "../inputs/StringWithAggregatesFilter";

@TypeGraphQL.InputType("ArrangementOfRoomScalarWhereWithAggregatesInput", {
  isAbstract: true
})
export class ArrangementOfRoomScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field(_type => [ArrangementOfRoomScalarWhereWithAggregatesInput], {
    nullable: true
  })
  AND?: ArrangementOfRoomScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [ArrangementOfRoomScalarWhereWithAggregatesInput], {
    nullable: true
  })
  OR?: ArrangementOfRoomScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [ArrangementOfRoomScalarWhereWithAggregatesInput], {
    nullable: true
  })
  NOT?: ArrangementOfRoomScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  roomId?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  arrangementId?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => IntWithAggregatesFilter, {
    nullable: true
  })
  capacity?: IntWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableWithAggregatesFilter, {
    nullable: true
  })
  details?: StringNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeWithAggregatesFilter, {
    nullable: true
  })
  createdAt?: DateTimeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeWithAggregatesFilter, {
    nullable: true
  })
  updatedAt?: DateTimeWithAggregatesFilter | undefined;
}
