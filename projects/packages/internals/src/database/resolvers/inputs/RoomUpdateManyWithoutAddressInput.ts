import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RoomCreateManyAddressInputEnvelope } from "../inputs/RoomCreateManyAddressInputEnvelope";
import { RoomCreateOrConnectWithoutAddressInput } from "../inputs/RoomCreateOrConnectWithoutAddressInput";
import { RoomCreateWithoutAddressInput } from "../inputs/RoomCreateWithoutAddressInput";
import { RoomScalarWhereInput } from "../inputs/RoomScalarWhereInput";
import { RoomUpdateManyWithWhereWithoutAddressInput } from "../inputs/RoomUpdateManyWithWhereWithoutAddressInput";
import { RoomUpdateWithWhereUniqueWithoutAddressInput } from "../inputs/RoomUpdateWithWhereUniqueWithoutAddressInput";
import { RoomUpsertWithWhereUniqueWithoutAddressInput } from "../inputs/RoomUpsertWithWhereUniqueWithoutAddressInput";
import { RoomWhereUniqueInput } from "../inputs/RoomWhereUniqueInput";

@TypeGraphQL.InputType("RoomUpdateManyWithoutAddressInput", {
  isAbstract: true
})
export class RoomUpdateManyWithoutAddressInput {
  @TypeGraphQL.Field(_type => [RoomCreateWithoutAddressInput], {
    nullable: true
  })
  create?: RoomCreateWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field(_type => [RoomCreateOrConnectWithoutAddressInput], {
    nullable: true
  })
  connectOrCreate?: RoomCreateOrConnectWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field(_type => [RoomUpsertWithWhereUniqueWithoutAddressInput], {
    nullable: true
  })
  upsert?: RoomUpsertWithWhereUniqueWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field(_type => RoomCreateManyAddressInputEnvelope, {
    nullable: true
  })
  createMany?: RoomCreateManyAddressInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [RoomWhereUniqueInput], {
    nullable: true
  })
  set?: RoomWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [RoomWhereUniqueInput], {
    nullable: true
  })
  disconnect?: RoomWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [RoomWhereUniqueInput], {
    nullable: true
  })
  delete?: RoomWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [RoomWhereUniqueInput], {
    nullable: true
  })
  connect?: RoomWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [RoomUpdateWithWhereUniqueWithoutAddressInput], {
    nullable: true
  })
  update?: RoomUpdateWithWhereUniqueWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field(_type => [RoomUpdateManyWithWhereWithoutAddressInput], {
    nullable: true
  })
  updateMany?: RoomUpdateManyWithWhereWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field(_type => [RoomScalarWhereInput], {
    nullable: true
  })
  deleteMany?: RoomScalarWhereInput[] | undefined;
}
