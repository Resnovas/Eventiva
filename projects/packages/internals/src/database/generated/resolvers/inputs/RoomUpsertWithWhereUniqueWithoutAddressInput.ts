import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RoomCreateWithoutAddressInput } from "../inputs/RoomCreateWithoutAddressInput";
import { RoomUpdateWithoutAddressInput } from "../inputs/RoomUpdateWithoutAddressInput";
import { RoomWhereUniqueInput } from "../inputs/RoomWhereUniqueInput";

@TypeGraphQL.InputType("RoomUpsertWithWhereUniqueWithoutAddressInput", {
  isAbstract: true
})
export class RoomUpsertWithWhereUniqueWithoutAddressInput {
  @TypeGraphQL.Field(_type => RoomWhereUniqueInput, {
    nullable: false
  })
  where!: RoomWhereUniqueInput;

  @TypeGraphQL.Field(_type => RoomUpdateWithoutAddressInput, {
    nullable: false
  })
  update!: RoomUpdateWithoutAddressInput;

  @TypeGraphQL.Field(_type => RoomCreateWithoutAddressInput, {
    nullable: false
  })
  create!: RoomCreateWithoutAddressInput;
}
