import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SIABadgeCreateManyAccountInputEnvelope } from "../inputs/SIABadgeCreateManyAccountInputEnvelope";
import { SIABadgeCreateOrConnectWithoutAccountInput } from "../inputs/SIABadgeCreateOrConnectWithoutAccountInput";
import { SIABadgeCreateWithoutAccountInput } from "../inputs/SIABadgeCreateWithoutAccountInput";
import { SIABadgeScalarWhereInput } from "../inputs/SIABadgeScalarWhereInput";
import { SIABadgeUpdateManyWithWhereWithoutAccountInput } from "../inputs/SIABadgeUpdateManyWithWhereWithoutAccountInput";
import { SIABadgeUpdateWithWhereUniqueWithoutAccountInput } from "../inputs/SIABadgeUpdateWithWhereUniqueWithoutAccountInput";
import { SIABadgeUpsertWithWhereUniqueWithoutAccountInput } from "../inputs/SIABadgeUpsertWithWhereUniqueWithoutAccountInput";
import { SIABadgeWhereUniqueInput } from "../inputs/SIABadgeWhereUniqueInput";

@TypeGraphQL.InputType("SIABadgeUpdateManyWithoutAccountInput", {
  isAbstract: true
})
export class SIABadgeUpdateManyWithoutAccountInput {
  @TypeGraphQL.Field(_type => [SIABadgeCreateWithoutAccountInput], {
    nullable: true
  })
  create?: SIABadgeCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [SIABadgeCreateOrConnectWithoutAccountInput], {
    nullable: true
  })
  connectOrCreate?: SIABadgeCreateOrConnectWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [SIABadgeUpsertWithWhereUniqueWithoutAccountInput], {
    nullable: true
  })
  upsert?: SIABadgeUpsertWithWhereUniqueWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => SIABadgeCreateManyAccountInputEnvelope, {
    nullable: true
  })
  createMany?: SIABadgeCreateManyAccountInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [SIABadgeWhereUniqueInput], {
    nullable: true
  })
  set?: SIABadgeWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [SIABadgeWhereUniqueInput], {
    nullable: true
  })
  disconnect?: SIABadgeWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [SIABadgeWhereUniqueInput], {
    nullable: true
  })
  delete?: SIABadgeWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [SIABadgeWhereUniqueInput], {
    nullable: true
  })
  connect?: SIABadgeWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [SIABadgeUpdateWithWhereUniqueWithoutAccountInput], {
    nullable: true
  })
  update?: SIABadgeUpdateWithWhereUniqueWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [SIABadgeUpdateManyWithWhereWithoutAccountInput], {
    nullable: true
  })
  updateMany?: SIABadgeUpdateManyWithWhereWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [SIABadgeScalarWhereInput], {
    nullable: true
  })
  deleteMany?: SIABadgeScalarWhereInput[] | undefined;
}
