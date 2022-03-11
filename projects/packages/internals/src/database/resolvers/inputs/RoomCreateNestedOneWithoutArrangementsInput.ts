import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RoomCreateOrConnectWithoutArrangementsInput } from "../inputs/RoomCreateOrConnectWithoutArrangementsInput";
import { RoomCreateWithoutArrangementsInput } from "../inputs/RoomCreateWithoutArrangementsInput";
import { RoomWhereUniqueInput } from "../inputs/RoomWhereUniqueInput";

@TypeGraphQL.InputType("RoomCreateNestedOneWithoutArrangementsInput", {
  isAbstract: true
})
export class RoomCreateNestedOneWithoutArrangementsInput {
  @TypeGraphQL.Field(_type => RoomCreateWithoutArrangementsInput, {
    nullable: true
  })
  create?: RoomCreateWithoutArrangementsInput | undefined;

  @TypeGraphQL.Field(_type => RoomCreateOrConnectWithoutArrangementsInput, {
    nullable: true
  })
  connectOrCreate?: RoomCreateOrConnectWithoutArrangementsInput | undefined;

  @TypeGraphQL.Field(_type => RoomWhereUniqueInput, {
    nullable: true
  })
  connect?: RoomWhereUniqueInput | undefined;
}
