import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ArrangementCreateWithoutRoomInput } from "../inputs/ArrangementCreateWithoutRoomInput";
import { ArrangementUpdateWithoutRoomInput } from "../inputs/ArrangementUpdateWithoutRoomInput";

@TypeGraphQL.InputType("ArrangementUpsertWithoutRoomInput", {
  isAbstract: true
})
export class ArrangementUpsertWithoutRoomInput {
  @TypeGraphQL.Field(_type => ArrangementUpdateWithoutRoomInput, {
    nullable: false
  })
  update!: ArrangementUpdateWithoutRoomInput;

  @TypeGraphQL.Field(_type => ArrangementCreateWithoutRoomInput, {
    nullable: false
  })
  create!: ArrangementCreateWithoutRoomInput;
}
