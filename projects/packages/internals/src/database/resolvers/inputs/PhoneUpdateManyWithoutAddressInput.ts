import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PhoneCreateManyAddressInputEnvelope } from "../inputs/PhoneCreateManyAddressInputEnvelope";
import { PhoneCreateOrConnectWithoutAddressInput } from "../inputs/PhoneCreateOrConnectWithoutAddressInput";
import { PhoneCreateWithoutAddressInput } from "../inputs/PhoneCreateWithoutAddressInput";
import { PhoneScalarWhereInput } from "../inputs/PhoneScalarWhereInput";
import { PhoneUpdateManyWithWhereWithoutAddressInput } from "../inputs/PhoneUpdateManyWithWhereWithoutAddressInput";
import { PhoneUpdateWithWhereUniqueWithoutAddressInput } from "../inputs/PhoneUpdateWithWhereUniqueWithoutAddressInput";
import { PhoneUpsertWithWhereUniqueWithoutAddressInput } from "../inputs/PhoneUpsertWithWhereUniqueWithoutAddressInput";
import { PhoneWhereUniqueInput } from "../inputs/PhoneWhereUniqueInput";

@TypeGraphQL.InputType("PhoneUpdateManyWithoutAddressInput", {
  isAbstract: true
})
export class PhoneUpdateManyWithoutAddressInput {
  @TypeGraphQL.Field(_type => [PhoneCreateWithoutAddressInput], {
    nullable: true
  })
  create?: PhoneCreateWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field(_type => [PhoneCreateOrConnectWithoutAddressInput], {
    nullable: true
  })
  connectOrCreate?: PhoneCreateOrConnectWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field(_type => [PhoneUpsertWithWhereUniqueWithoutAddressInput], {
    nullable: true
  })
  upsert?: PhoneUpsertWithWhereUniqueWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field(_type => PhoneCreateManyAddressInputEnvelope, {
    nullable: true
  })
  createMany?: PhoneCreateManyAddressInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [PhoneWhereUniqueInput], {
    nullable: true
  })
  set?: PhoneWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [PhoneWhereUniqueInput], {
    nullable: true
  })
  disconnect?: PhoneWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [PhoneWhereUniqueInput], {
    nullable: true
  })
  delete?: PhoneWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [PhoneWhereUniqueInput], {
    nullable: true
  })
  connect?: PhoneWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [PhoneUpdateWithWhereUniqueWithoutAddressInput], {
    nullable: true
  })
  update?: PhoneUpdateWithWhereUniqueWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field(_type => [PhoneUpdateManyWithWhereWithoutAddressInput], {
    nullable: true
  })
  updateMany?: PhoneUpdateManyWithWhereWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field(_type => [PhoneScalarWhereInput], {
    nullable: true
  })
  deleteMany?: PhoneScalarWhereInput[] | undefined;
}
