import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PhoneCreateManyAccountInputEnvelope } from "../inputs/PhoneCreateManyAccountInputEnvelope";
import { PhoneCreateOrConnectWithoutAccountInput } from "../inputs/PhoneCreateOrConnectWithoutAccountInput";
import { PhoneCreateWithoutAccountInput } from "../inputs/PhoneCreateWithoutAccountInput";
import { PhoneScalarWhereInput } from "../inputs/PhoneScalarWhereInput";
import { PhoneUpdateManyWithWhereWithoutAccountInput } from "../inputs/PhoneUpdateManyWithWhereWithoutAccountInput";
import { PhoneUpdateWithWhereUniqueWithoutAccountInput } from "../inputs/PhoneUpdateWithWhereUniqueWithoutAccountInput";
import { PhoneUpsertWithWhereUniqueWithoutAccountInput } from "../inputs/PhoneUpsertWithWhereUniqueWithoutAccountInput";
import { PhoneWhereUniqueInput } from "../inputs/PhoneWhereUniqueInput";

@TypeGraphQL.InputType("PhoneUpdateManyWithoutAccountInput", {
  isAbstract: true
})
export class PhoneUpdateManyWithoutAccountInput {
  @TypeGraphQL.Field(_type => [PhoneCreateWithoutAccountInput], {
    nullable: true
  })
  create?: PhoneCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [PhoneCreateOrConnectWithoutAccountInput], {
    nullable: true
  })
  connectOrCreate?: PhoneCreateOrConnectWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [PhoneUpsertWithWhereUniqueWithoutAccountInput], {
    nullable: true
  })
  upsert?: PhoneUpsertWithWhereUniqueWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => PhoneCreateManyAccountInputEnvelope, {
    nullable: true
  })
  createMany?: PhoneCreateManyAccountInputEnvelope | undefined;

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

  @TypeGraphQL.Field(_type => [PhoneUpdateWithWhereUniqueWithoutAccountInput], {
    nullable: true
  })
  update?: PhoneUpdateWithWhereUniqueWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [PhoneUpdateManyWithWhereWithoutAccountInput], {
    nullable: true
  })
  updateMany?: PhoneUpdateManyWithWhereWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [PhoneScalarWhereInput], {
    nullable: true
  })
  deleteMany?: PhoneScalarWhereInput[] | undefined;
}
