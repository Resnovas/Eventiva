import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ArrangementOfRoomCreateManyArrangementInputEnvelope } from "../inputs/ArrangementOfRoomCreateManyArrangementInputEnvelope";
import { ArrangementOfRoomCreateOrConnectWithoutArrangementInput } from "../inputs/ArrangementOfRoomCreateOrConnectWithoutArrangementInput";
import { ArrangementOfRoomCreateWithoutArrangementInput } from "../inputs/ArrangementOfRoomCreateWithoutArrangementInput";
import { ArrangementOfRoomWhereUniqueInput } from "../inputs/ArrangementOfRoomWhereUniqueInput";

@TypeGraphQL.InputType("ArrangementOfRoomCreateNestedManyWithoutArrangementInput", {
  isAbstract: true
})
export class ArrangementOfRoomCreateNestedManyWithoutArrangementInput {
  @TypeGraphQL.Field(_type => [ArrangementOfRoomCreateWithoutArrangementInput], {
    nullable: true
  })
  create?: ArrangementOfRoomCreateWithoutArrangementInput[] | undefined;

  @TypeGraphQL.Field(_type => [ArrangementOfRoomCreateOrConnectWithoutArrangementInput], {
    nullable: true
  })
  connectOrCreate?: ArrangementOfRoomCreateOrConnectWithoutArrangementInput[] | undefined;

  @TypeGraphQL.Field(_type => ArrangementOfRoomCreateManyArrangementInputEnvelope, {
    nullable: true
  })
  createMany?: ArrangementOfRoomCreateManyArrangementInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [ArrangementOfRoomWhereUniqueInput], {
    nullable: true
  })
  connect?: ArrangementOfRoomWhereUniqueInput[] | undefined;
}
