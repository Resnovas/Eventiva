import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ArrangementOfRoomCreateWithoutRoomInput } from "../inputs/ArrangementOfRoomCreateWithoutRoomInput";
import { ArrangementOfRoomUpdateWithoutRoomInput } from "../inputs/ArrangementOfRoomUpdateWithoutRoomInput";
import { ArrangementOfRoomWhereUniqueInput } from "../inputs/ArrangementOfRoomWhereUniqueInput";

@TypeGraphQL.InputType("ArrangementOfRoomUpsertWithWhereUniqueWithoutRoomInput", {
  isAbstract: true
})
export class ArrangementOfRoomUpsertWithWhereUniqueWithoutRoomInput {
  @TypeGraphQL.Field(_type => ArrangementOfRoomWhereUniqueInput, {
    nullable: false
  })
  where!: ArrangementOfRoomWhereUniqueInput;

  @TypeGraphQL.Field(_type => ArrangementOfRoomUpdateWithoutRoomInput, {
    nullable: false
  })
  update!: ArrangementOfRoomUpdateWithoutRoomInput;

  @TypeGraphQL.Field(_type => ArrangementOfRoomCreateWithoutRoomInput, {
    nullable: false
  })
  create!: ArrangementOfRoomCreateWithoutRoomInput;
}
