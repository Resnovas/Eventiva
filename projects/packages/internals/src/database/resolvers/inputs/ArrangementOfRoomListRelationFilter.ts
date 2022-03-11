import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ArrangementOfRoomWhereInput } from "../inputs/ArrangementOfRoomWhereInput";

@TypeGraphQL.InputType("ArrangementOfRoomListRelationFilter", {
  isAbstract: true
})
export class ArrangementOfRoomListRelationFilter {
  @TypeGraphQL.Field(_type => ArrangementOfRoomWhereInput, {
    nullable: true
  })
  every?: ArrangementOfRoomWhereInput | undefined;

  @TypeGraphQL.Field(_type => ArrangementOfRoomWhereInput, {
    nullable: true
  })
  some?: ArrangementOfRoomWhereInput | undefined;

  @TypeGraphQL.Field(_type => ArrangementOfRoomWhereInput, {
    nullable: true
  })
  none?: ArrangementOfRoomWhereInput | undefined;
}
