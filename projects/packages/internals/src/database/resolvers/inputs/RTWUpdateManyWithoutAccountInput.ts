import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RTWCreateManyAccountInputEnvelope } from "../inputs/RTWCreateManyAccountInputEnvelope";
import { RTWCreateOrConnectWithoutAccountInput } from "../inputs/RTWCreateOrConnectWithoutAccountInput";
import { RTWCreateWithoutAccountInput } from "../inputs/RTWCreateWithoutAccountInput";
import { RTWScalarWhereInput } from "../inputs/RTWScalarWhereInput";
import { RTWUpdateManyWithWhereWithoutAccountInput } from "../inputs/RTWUpdateManyWithWhereWithoutAccountInput";
import { RTWUpdateWithWhereUniqueWithoutAccountInput } from "../inputs/RTWUpdateWithWhereUniqueWithoutAccountInput";
import { RTWUpsertWithWhereUniqueWithoutAccountInput } from "../inputs/RTWUpsertWithWhereUniqueWithoutAccountInput";
import { RTWWhereUniqueInput } from "../inputs/RTWWhereUniqueInput";

@TypeGraphQL.InputType("RTWUpdateManyWithoutAccountInput", {
  isAbstract: true
})
export class RTWUpdateManyWithoutAccountInput {
  @TypeGraphQL.Field(_type => [RTWCreateWithoutAccountInput], {
    nullable: true
  })
  create?: RTWCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [RTWCreateOrConnectWithoutAccountInput], {
    nullable: true
  })
  connectOrCreate?: RTWCreateOrConnectWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [RTWUpsertWithWhereUniqueWithoutAccountInput], {
    nullable: true
  })
  upsert?: RTWUpsertWithWhereUniqueWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => RTWCreateManyAccountInputEnvelope, {
    nullable: true
  })
  createMany?: RTWCreateManyAccountInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [RTWWhereUniqueInput], {
    nullable: true
  })
  set?: RTWWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [RTWWhereUniqueInput], {
    nullable: true
  })
  disconnect?: RTWWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [RTWWhereUniqueInput], {
    nullable: true
  })
  delete?: RTWWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [RTWWhereUniqueInput], {
    nullable: true
  })
  connect?: RTWWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [RTWUpdateWithWhereUniqueWithoutAccountInput], {
    nullable: true
  })
  update?: RTWUpdateWithWhereUniqueWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [RTWUpdateManyWithWhereWithoutAccountInput], {
    nullable: true
  })
  updateMany?: RTWUpdateManyWithWhereWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [RTWScalarWhereInput], {
    nullable: true
  })
  deleteMany?: RTWScalarWhereInput[] | undefined;
}
