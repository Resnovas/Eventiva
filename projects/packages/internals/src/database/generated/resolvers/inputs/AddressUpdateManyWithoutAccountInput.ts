import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AddressCreateManyAccountInputEnvelope } from "../inputs/AddressCreateManyAccountInputEnvelope";
import { AddressCreateOrConnectWithoutAccountInput } from "../inputs/AddressCreateOrConnectWithoutAccountInput";
import { AddressCreateWithoutAccountInput } from "../inputs/AddressCreateWithoutAccountInput";
import { AddressScalarWhereInput } from "../inputs/AddressScalarWhereInput";
import { AddressUpdateManyWithWhereWithoutAccountInput } from "../inputs/AddressUpdateManyWithWhereWithoutAccountInput";
import { AddressUpdateWithWhereUniqueWithoutAccountInput } from "../inputs/AddressUpdateWithWhereUniqueWithoutAccountInput";
import { AddressUpsertWithWhereUniqueWithoutAccountInput } from "../inputs/AddressUpsertWithWhereUniqueWithoutAccountInput";
import { AddressWhereUniqueInput } from "../inputs/AddressWhereUniqueInput";

@TypeGraphQL.InputType("AddressUpdateManyWithoutAccountInput", {
  isAbstract: true
})
export class AddressUpdateManyWithoutAccountInput {
  @TypeGraphQL.Field(_type => [AddressCreateWithoutAccountInput], {
    nullable: true
  })
  create?: AddressCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [AddressCreateOrConnectWithoutAccountInput], {
    nullable: true
  })
  connectOrCreate?: AddressCreateOrConnectWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [AddressUpsertWithWhereUniqueWithoutAccountInput], {
    nullable: true
  })
  upsert?: AddressUpsertWithWhereUniqueWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => AddressCreateManyAccountInputEnvelope, {
    nullable: true
  })
  createMany?: AddressCreateManyAccountInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [AddressWhereUniqueInput], {
    nullable: true
  })
  set?: AddressWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [AddressWhereUniqueInput], {
    nullable: true
  })
  disconnect?: AddressWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [AddressWhereUniqueInput], {
    nullable: true
  })
  delete?: AddressWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [AddressWhereUniqueInput], {
    nullable: true
  })
  connect?: AddressWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [AddressUpdateWithWhereUniqueWithoutAccountInput], {
    nullable: true
  })
  update?: AddressUpdateWithWhereUniqueWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [AddressUpdateManyWithWhereWithoutAccountInput], {
    nullable: true
  })
  updateMany?: AddressUpdateManyWithWhereWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [AddressScalarWhereInput], {
    nullable: true
  })
  deleteMany?: AddressScalarWhereInput[] | undefined;
}
