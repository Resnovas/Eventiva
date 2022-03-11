import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ArrangementOfRoomCreateWithoutRoomInput } from "../inputs/ArrangementOfRoomCreateWithoutRoomInput";
import { ArrangementOfRoomWhereUniqueInput } from "../inputs/ArrangementOfRoomWhereUniqueInput";

@TypeGraphQL.InputType("ArrangementOfRoomCreateOrConnectWithoutRoomInput", {
  isAbstract: true
})
export class ArrangementOfRoomCreateOrConnectWithoutRoomInput {
  @TypeGraphQL.Field(_type => ArrangementOfRoomWhereUniqueInput, {
    nullable: false
  })
  where!: ArrangementOfRoomWhereUniqueInput;

  @TypeGraphQL.Field(_type => ArrangementOfRoomCreateWithoutRoomInput, {
    nullable: false
  })
  create!: ArrangementOfRoomCreateWithoutRoomInput;
}
