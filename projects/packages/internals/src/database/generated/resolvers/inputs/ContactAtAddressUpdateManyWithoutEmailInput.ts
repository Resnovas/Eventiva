import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ContactAtAddressCreateManyEmailInputEnvelope } from "../inputs/ContactAtAddressCreateManyEmailInputEnvelope";
import { ContactAtAddressCreateOrConnectWithoutEmailInput } from "../inputs/ContactAtAddressCreateOrConnectWithoutEmailInput";
import { ContactAtAddressCreateWithoutEmailInput } from "../inputs/ContactAtAddressCreateWithoutEmailInput";
import { ContactAtAddressScalarWhereInput } from "../inputs/ContactAtAddressScalarWhereInput";
import { ContactAtAddressUpdateManyWithWhereWithoutEmailInput } from "../inputs/ContactAtAddressUpdateManyWithWhereWithoutEmailInput";
import { ContactAtAddressUpdateWithWhereUniqueWithoutEmailInput } from "../inputs/ContactAtAddressUpdateWithWhereUniqueWithoutEmailInput";
import { ContactAtAddressUpsertWithWhereUniqueWithoutEmailInput } from "../inputs/ContactAtAddressUpsertWithWhereUniqueWithoutEmailInput";
import { ContactAtAddressWhereUniqueInput } from "../inputs/ContactAtAddressWhereUniqueInput";

@TypeGraphQL.InputType("ContactAtAddressUpdateManyWithoutEmailInput", {
  isAbstract: true
})
export class ContactAtAddressUpdateManyWithoutEmailInput {
  @TypeGraphQL.Field(_type => [ContactAtAddressCreateWithoutEmailInput], {
    nullable: true
  })
  create?: ContactAtAddressCreateWithoutEmailInput[] | undefined;

  @TypeGraphQL.Field(_type => [ContactAtAddressCreateOrConnectWithoutEmailInput], {
    nullable: true
  })
  connectOrCreate?: ContactAtAddressCreateOrConnectWithoutEmailInput[] | undefined;

  @TypeGraphQL.Field(_type => [ContactAtAddressUpsertWithWhereUniqueWithoutEmailInput], {
    nullable: true
  })
  upsert?: ContactAtAddressUpsertWithWhereUniqueWithoutEmailInput[] | undefined;

  @TypeGraphQL.Field(_type => ContactAtAddressCreateManyEmailInputEnvelope, {
    nullable: true
  })
  createMany?: ContactAtAddressCreateManyEmailInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [ContactAtAddressWhereUniqueInput], {
    nullable: true
  })
  set?: ContactAtAddressWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [ContactAtAddressWhereUniqueInput], {
    nullable: true
  })
  disconnect?: ContactAtAddressWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [ContactAtAddressWhereUniqueInput], {
    nullable: true
  })
  delete?: ContactAtAddressWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [ContactAtAddressWhereUniqueInput], {
    nullable: true
  })
  connect?: ContactAtAddressWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [ContactAtAddressUpdateWithWhereUniqueWithoutEmailInput], {
    nullable: true
  })
  update?: ContactAtAddressUpdateWithWhereUniqueWithoutEmailInput[] | undefined;

  @TypeGraphQL.Field(_type => [ContactAtAddressUpdateManyWithWhereWithoutEmailInput], {
    nullable: true
  })
  updateMany?: ContactAtAddressUpdateManyWithWhereWithoutEmailInput[] | undefined;

  @TypeGraphQL.Field(_type => [ContactAtAddressScalarWhereInput], {
    nullable: true
  })
  deleteMany?: ContactAtAddressScalarWhereInput[] | undefined;
}
