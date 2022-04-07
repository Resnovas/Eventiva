import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { BoolNullableFilter } from "../inputs/BoolNullableFilter";
import { DateTimeFilter } from "../inputs/DateTimeFilter";
import { DateTimeNullableFilter } from "../inputs/DateTimeNullableFilter";
import { IntFilter } from "../inputs/IntFilter";
import { StringFilter } from "../inputs/StringFilter";
import { StringNullableFilter } from "../inputs/StringNullableFilter";

@TypeGraphQL.InputType("ArrangementOfRoomScalarWhereInput", {
  isAbstract: true
})
export class ArrangementOfRoomScalarWhereInput {
  @TypeGraphQL.Field(_type => [ArrangementOfRoomScalarWhereInput], {
    nullable: true
  })
  AND?: ArrangementOfRoomScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [ArrangementOfRoomScalarWhereInput], {
    nullable: true
  })
  OR?: ArrangementOfRoomScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [ArrangementOfRoomScalarWhereInput], {
    nullable: true
  })
  NOT?: ArrangementOfRoomScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  roomId?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  arrangementId?: StringFilter | undefined;

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
