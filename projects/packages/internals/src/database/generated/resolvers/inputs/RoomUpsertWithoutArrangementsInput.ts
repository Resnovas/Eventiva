import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RoomCreateWithoutArrangementsInput } from "../inputs/RoomCreateWithoutArrangementsInput";
import { RoomUpdateWithoutArrangementsInput } from "../inputs/RoomUpdateWithoutArrangementsInput";

@TypeGraphQL.InputType("RoomUpsertWithoutArrangementsInput", {
  isAbstract: true
})
export class RoomUpsertWithoutArrangementsInput {
  @TypeGraphQL.Field(_type => RoomUpdateWithoutArrangementsInput, {
    nullable: false
  })
  update!: RoomUpdateWithoutArrangementsInput;

  @TypeGraphQL.Field(_type => RoomCreateWithoutArrangementsInput, {
    nullable: false
  })
  create!: RoomCreateWithoutArrangementsInput;
}
