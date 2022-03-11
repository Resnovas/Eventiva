import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RoomCreateManyAddressInputEnvelope } from "../inputs/RoomCreateManyAddressInputEnvelope";
import { RoomCreateOrConnectWithoutAddressInput } from "../inputs/RoomCreateOrConnectWithoutAddressInput";
import { RoomCreateWithoutAddressInput } from "../inputs/RoomCreateWithoutAddressInput";
import { RoomWhereUniqueInput } from "../inputs/RoomWhereUniqueInput";

@TypeGraphQL.InputType("RoomCreateNestedManyWithoutAddressInput", {
  isAbstract: true
})
export class RoomCreateNestedManyWithoutAddressInput {
  @TypeGraphQL.Field(_type => [RoomCreateWithoutAddressInput], {
    nullable: true
  })
  create?: RoomCreateWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field(_type => [RoomCreateOrConnectWithoutAddressInput], {
    nullable: true
  })
  connectOrCreate?: RoomCreateOrConnectWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field(_type => RoomCreateManyAddressInputEnvelope, {
    nullable: true
  })
  createMany?: RoomCreateManyAddressInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [RoomWhereUniqueInput], {
    nullable: true
  })
  connect?: RoomWhereUniqueInput[] | undefined;
}
