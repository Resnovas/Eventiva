import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { TokenCreateManyAccountInputEnvelope } from "../inputs/TokenCreateManyAccountInputEnvelope";
import { TokenCreateOrConnectWithoutAccountInput } from "../inputs/TokenCreateOrConnectWithoutAccountInput";
import { TokenCreateWithoutAccountInput } from "../inputs/TokenCreateWithoutAccountInput";
import { TokenScalarWhereInput } from "../inputs/TokenScalarWhereInput";
import { TokenUpdateManyWithWhereWithoutAccountInput } from "../inputs/TokenUpdateManyWithWhereWithoutAccountInput";
import { TokenUpdateWithWhereUniqueWithoutAccountInput } from "../inputs/TokenUpdateWithWhereUniqueWithoutAccountInput";
import { TokenUpsertWithWhereUniqueWithoutAccountInput } from "../inputs/TokenUpsertWithWhereUniqueWithoutAccountInput";
import { TokenWhereUniqueInput } from "../inputs/TokenWhereUniqueInput";

@TypeGraphQL.InputType("TokenUpdateManyWithoutAccountInput", {
  isAbstract: true
})
export class TokenUpdateManyWithoutAccountInput {
  @TypeGraphQL.Field(_type => [TokenCreateWithoutAccountInput], {
    nullable: true
  })
  create?: TokenCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [TokenCreateOrConnectWithoutAccountInput], {
    nullable: true
  })
  connectOrCreate?: TokenCreateOrConnectWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [TokenUpsertWithWhereUniqueWithoutAccountInput], {
    nullable: true
  })
  upsert?: TokenUpsertWithWhereUniqueWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => TokenCreateManyAccountInputEnvelope, {
    nullable: true
  })
  createMany?: TokenCreateManyAccountInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [TokenWhereUniqueInput], {
    nullable: true
  })
  set?: TokenWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [TokenWhereUniqueInput], {
    nullable: true
  })
  disconnect?: TokenWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [TokenWhereUniqueInput], {
    nullable: true
  })
  delete?: TokenWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [TokenWhereUniqueInput], {
    nullable: true
  })
  connect?: TokenWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [TokenUpdateWithWhereUniqueWithoutAccountInput], {
    nullable: true
  })
  update?: TokenUpdateWithWhereUniqueWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [TokenUpdateManyWithWhereWithoutAccountInput], {
    nullable: true
  })
  updateMany?: TokenUpdateManyWithWhereWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [TokenScalarWhereInput], {
    nullable: true
  })
  deleteMany?: TokenScalarWhereInput[] | undefined;
}
