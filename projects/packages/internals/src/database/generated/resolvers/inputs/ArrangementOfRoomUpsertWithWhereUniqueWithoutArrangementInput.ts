import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ArrangementOfRoomCreateWithoutArrangementInput } from "../inputs/ArrangementOfRoomCreateWithoutArrangementInput";
import { ArrangementOfRoomUpdateWithoutArrangementInput } from "../inputs/ArrangementOfRoomUpdateWithoutArrangementInput";
import { ArrangementOfRoomWhereUniqueInput } from "../inputs/ArrangementOfRoomWhereUniqueInput";

@TypeGraphQL.InputType("ArrangementOfRoomUpsertWithWhereUniqueWithoutArrangementInput", {
  isAbstract: true
})
export class ArrangementOfRoomUpsertWithWhereUniqueWithoutArrangementInput {
  @TypeGraphQL.Field(_type => ArrangementOfRoomWhereUniqueInput, {
    nullable: false
  })
  where!: ArrangementOfRoomWhereUniqueInput;

  @TypeGraphQL.Field(_type => ArrangementOfRoomUpdateWithoutArrangementInput, {
    nullable: false
  })
  update!: ArrangementOfRoomUpdateWithoutArrangementInput;

  @TypeGraphQL.Field(_type => ArrangementOfRoomCreateWithoutArrangementInput, {
    nullable: false
  })
  create!: ArrangementOfRoomCreateWithoutArrangementInput;
}
