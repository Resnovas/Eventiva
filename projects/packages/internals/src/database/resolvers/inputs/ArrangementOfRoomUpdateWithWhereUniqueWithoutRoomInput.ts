import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ArrangementOfRoomUpdateWithoutRoomInput } from "../inputs/ArrangementOfRoomUpdateWithoutRoomInput";
import { ArrangementOfRoomWhereUniqueInput } from "../inputs/ArrangementOfRoomWhereUniqueInput";

@TypeGraphQL.InputType("ArrangementOfRoomUpdateWithWhereUniqueWithoutRoomInput", {
  isAbstract: true
})
export class ArrangementOfRoomUpdateWithWhereUniqueWithoutRoomInput {
  @TypeGraphQL.Field(_type => ArrangementOfRoomWhereUniqueInput, {
    nullable: false
  })
  where!: ArrangementOfRoomWhereUniqueInput;

  @TypeGraphQL.Field(_type => ArrangementOfRoomUpdateWithoutRoomInput, {
    nullable: false
  })
  data!: ArrangementOfRoomUpdateWithoutRoomInput;
}
