import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RoomUpdateWithoutAddressInput } from "../inputs/RoomUpdateWithoutAddressInput";
import { RoomWhereUniqueInput } from "../inputs/RoomWhereUniqueInput";

@TypeGraphQL.InputType("RoomUpdateWithWhereUniqueWithoutAddressInput", {
  isAbstract: true
})
export class RoomUpdateWithWhereUniqueWithoutAddressInput {
  @TypeGraphQL.Field(_type => RoomWhereUniqueInput, {
    nullable: false
  })
  where!: RoomWhereUniqueInput;

  @TypeGraphQL.Field(_type => RoomUpdateWithoutAddressInput, {
    nullable: false
  })
  data!: RoomUpdateWithoutAddressInput;
}
