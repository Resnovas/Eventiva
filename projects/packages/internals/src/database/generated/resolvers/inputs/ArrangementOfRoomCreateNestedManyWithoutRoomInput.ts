import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ArrangementOfRoomCreateManyRoomInputEnvelope } from "../inputs/ArrangementOfRoomCreateManyRoomInputEnvelope";
import { ArrangementOfRoomCreateOrConnectWithoutRoomInput } from "../inputs/ArrangementOfRoomCreateOrConnectWithoutRoomInput";
import { ArrangementOfRoomCreateWithoutRoomInput } from "../inputs/ArrangementOfRoomCreateWithoutRoomInput";
import { ArrangementOfRoomWhereUniqueInput } from "../inputs/ArrangementOfRoomWhereUniqueInput";

@TypeGraphQL.InputType("ArrangementOfRoomCreateNestedManyWithoutRoomInput", {
  isAbstract: true
})
export class ArrangementOfRoomCreateNestedManyWithoutRoomInput {
  @TypeGraphQL.Field(_type => [ArrangementOfRoomCreateWithoutRoomInput], {
    nullable: true
  })
  create?: ArrangementOfRoomCreateWithoutRoomInput[] | undefined;

  @TypeGraphQL.Field(_type => [ArrangementOfRoomCreateOrConnectWithoutRoomInput], {
    nullable: true
  })
  connectOrCreate?: ArrangementOfRoomCreateOrConnectWithoutRoomInput[] | undefined;

  @TypeGraphQL.Field(_type => ArrangementOfRoomCreateManyRoomInputEnvelope, {
    nullable: true
  })
  createMany?: ArrangementOfRoomCreateManyRoomInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [ArrangementOfRoomWhereUniqueInput], {
    nullable: true
  })
  connect?: ArrangementOfRoomWhereUniqueInput[] | undefined;
}
