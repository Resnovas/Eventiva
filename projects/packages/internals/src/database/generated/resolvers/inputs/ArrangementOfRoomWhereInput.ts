import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ArrangementRelationFilter } from "../inputs/ArrangementRelationFilter";
import { BoolNullableFilter } from "../inputs/BoolNullableFilter";
import { DateTimeFilter } from "../inputs/DateTimeFilter";
import { DateTimeNullableFilter } from "../inputs/DateTimeNullableFilter";
import { IntFilter } from "../inputs/IntFilter";
import { RoomRelationFilter } from "../inputs/RoomRelationFilter";
import { StringFilter } from "../inputs/StringFilter";
import { StringNullableFilter } from "../inputs/StringNullableFilter";

@TypeGraphQL.InputType("ArrangementOfRoomWhereInput", {
  isAbstract: true
})
export class ArrangementOfRoomWhereInput {
  @TypeGraphQL.Field(_type => [ArrangementOfRoomWhereInput], {
    nullable: true
  })
  AND?: ArrangementOfRoomWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [ArrangementOfRoomWhereInput], {
    nullable: true
  })
  OR?: ArrangementOfRoomWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [ArrangementOfRoomWhereInput], {
    nullable: true
  })
  NOT?: ArrangementOfRoomWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  roomId?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  arrangementId?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => ArrangementRelationFilter, {
    nullable: true
  })
  arrangement?: ArrangementRelationFilter | undefined;

  @TypeGraphQL.Field(_type => RoomRelationFilter, {
    nullable: true
  })
  room?: RoomRelationFilter | undefined;

  @TypeGraphQL.Field(_type => IntFilter, {
    nullable: true
  })
  capacity?: IntFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  details?: StringNullableFilter | undefined;

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
