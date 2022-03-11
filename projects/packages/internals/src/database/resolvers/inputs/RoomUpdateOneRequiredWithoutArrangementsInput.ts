import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RoomCreateOrConnectWithoutArrangementsInput } from "../inputs/RoomCreateOrConnectWithoutArrangementsInput";
import { RoomCreateWithoutArrangementsInput } from "../inputs/RoomCreateWithoutArrangementsInput";
import { RoomUpdateWithoutArrangementsInput } from "../inputs/RoomUpdateWithoutArrangementsInput";
import { RoomUpsertWithoutArrangementsInput } from "../inputs/RoomUpsertWithoutArrangementsInput";
import { RoomWhereUniqueInput } from "../inputs/RoomWhereUniqueInput";

@TypeGraphQL.InputType("RoomUpdateOneRequiredWithoutArrangementsInput", {
  isAbstract: true
})
export class RoomUpdateOneRequiredWithoutArrangementsInput {
  @TypeGraphQL.Field(_type => RoomCreateWithoutArrangementsInput, {
    nullable: true
  })
  create?: RoomCreateWithoutArrangementsInput | undefined;

  @TypeGraphQL.Field(_type => RoomCreateOrConnectWithoutArrangementsInput, {
    nullable: true
  })
  connectOrCreate?: RoomCreateOrConnectWithoutArrangementsInput | undefined;

  @TypeGraphQL.Field(_type => RoomUpsertWithoutArrangementsInput, {
    nullable: true
  })
  upsert?: RoomUpsertWithoutArrangementsInput | undefined;

  @TypeGraphQL.Field(_type => RoomWhereUniqueInput, {
    nullable: true
  })
  connect?: RoomWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => RoomUpdateWithoutArrangementsInput, {
    nullable: true
  })
  update?: RoomUpdateWithoutArrangementsInput | undefined;
}
