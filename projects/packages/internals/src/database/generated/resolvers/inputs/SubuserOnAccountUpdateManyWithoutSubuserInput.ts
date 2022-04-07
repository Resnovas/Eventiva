import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SubuserOnAccountCreateManySubuserInputEnvelope } from "../inputs/SubuserOnAccountCreateManySubuserInputEnvelope";
import { SubuserOnAccountCreateOrConnectWithoutSubuserInput } from "../inputs/SubuserOnAccountCreateOrConnectWithoutSubuserInput";
import { SubuserOnAccountCreateWithoutSubuserInput } from "../inputs/SubuserOnAccountCreateWithoutSubuserInput";
import { SubuserOnAccountScalarWhereInput } from "../inputs/SubuserOnAccountScalarWhereInput";
import { SubuserOnAccountUpdateManyWithWhereWithoutSubuserInput } from "../inputs/SubuserOnAccountUpdateManyWithWhereWithoutSubuserInput";
import { SubuserOnAccountUpdateWithWhereUniqueWithoutSubuserInput } from "../inputs/SubuserOnAccountUpdateWithWhereUniqueWithoutSubuserInput";
import { SubuserOnAccountUpsertWithWhereUniqueWithoutSubuserInput } from "../inputs/SubuserOnAccountUpsertWithWhereUniqueWithoutSubuserInput";
import { SubuserOnAccountWhereUniqueInput } from "../inputs/SubuserOnAccountWhereUniqueInput";

@TypeGraphQL.InputType("SubuserOnAccountUpdateManyWithoutSubuserInput", {
  isAbstract: true
})
export class SubuserOnAccountUpdateManyWithoutSubuserInput {
  @TypeGraphQL.Field(_type => [SubuserOnAccountCreateWithoutSubuserInput], {
    nullable: true
  })
  create?: SubuserOnAccountCreateWithoutSubuserInput[] | undefined;

  @TypeGraphQL.Field(_type => [SubuserOnAccountCreateOrConnectWithoutSubuserInput], {
    nullable: true
  })
  connectOrCreate?: SubuserOnAccountCreateOrConnectWithoutSubuserInput[] | undefined;

  @TypeGraphQL.Field(_type => [SubuserOnAccountUpsertWithWhereUniqueWithoutSubuserInput], {
    nullable: true
  })
  upsert?: SubuserOnAccountUpsertWithWhereUniqueWithoutSubuserInput[] | undefined;

  @TypeGraphQL.Field(_type => SubuserOnAccountCreateManySubuserInputEnvelope, {
    nullable: true
  })
  createMany?: SubuserOnAccountCreateManySubuserInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [SubuserOnAccountWhereUniqueInput], {
    nullable: true
  })
  set?: SubuserOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [SubuserOnAccountWhereUniqueInput], {
    nullable: true
  })
  disconnect?: SubuserOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [SubuserOnAccountWhereUniqueInput], {
    nullable: true
  })
  delete?: SubuserOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [SubuserOnAccountWhereUniqueInput], {
    nullable: true
  })
  connect?: SubuserOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [SubuserOnAccountUpdateWithWhereUniqueWithoutSubuserInput], {
    nullable: true
  })
  update?: SubuserOnAccountUpdateWithWhereUniqueWithoutSubuserInput[] | undefined;

  @TypeGraphQL.Field(_type => [SubuserOnAccountUpdateManyWithWhereWithoutSubuserInput], {
    nullable: true
  })
  updateMany?: SubuserOnAccountUpdateManyWithWhereWithoutSubuserInput[] | undefined;

  @TypeGraphQL.Field(_type => [SubuserOnAccountScalarWhereInput], {
    nullable: true
  })
  deleteMany?: SubuserOnAccountScalarWhereInput[] | undefined;
}
