import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SubscriptionOnAccountCreateManyAccountInputEnvelope } from "../inputs/SubscriptionOnAccountCreateManyAccountInputEnvelope";
import { SubscriptionOnAccountCreateOrConnectWithoutAccountInput } from "../inputs/SubscriptionOnAccountCreateOrConnectWithoutAccountInput";
import { SubscriptionOnAccountCreateWithoutAccountInput } from "../inputs/SubscriptionOnAccountCreateWithoutAccountInput";
import { SubscriptionOnAccountScalarWhereInput } from "../inputs/SubscriptionOnAccountScalarWhereInput";
import { SubscriptionOnAccountUpdateManyWithWhereWithoutAccountInput } from "../inputs/SubscriptionOnAccountUpdateManyWithWhereWithoutAccountInput";
import { SubscriptionOnAccountUpdateWithWhereUniqueWithoutAccountInput } from "../inputs/SubscriptionOnAccountUpdateWithWhereUniqueWithoutAccountInput";
import { SubscriptionOnAccountUpsertWithWhereUniqueWithoutAccountInput } from "../inputs/SubscriptionOnAccountUpsertWithWhereUniqueWithoutAccountInput";
import { SubscriptionOnAccountWhereUniqueInput } from "../inputs/SubscriptionOnAccountWhereUniqueInput";

@TypeGraphQL.InputType("SubscriptionOnAccountUpdateManyWithoutAccountInput", {
  isAbstract: true
})
export class SubscriptionOnAccountUpdateManyWithoutAccountInput {
  @TypeGraphQL.Field(_type => [SubscriptionOnAccountCreateWithoutAccountInput], {
    nullable: true
  })
  create?: SubscriptionOnAccountCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [SubscriptionOnAccountCreateOrConnectWithoutAccountInput], {
    nullable: true
  })
  connectOrCreate?: SubscriptionOnAccountCreateOrConnectWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [SubscriptionOnAccountUpsertWithWhereUniqueWithoutAccountInput], {
    nullable: true
  })
  upsert?: SubscriptionOnAccountUpsertWithWhereUniqueWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => SubscriptionOnAccountCreateManyAccountInputEnvelope, {
    nullable: true
  })
  createMany?: SubscriptionOnAccountCreateManyAccountInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [SubscriptionOnAccountWhereUniqueInput], {
    nullable: true
  })
  set?: SubscriptionOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [SubscriptionOnAccountWhereUniqueInput], {
    nullable: true
  })
  disconnect?: SubscriptionOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [SubscriptionOnAccountWhereUniqueInput], {
    nullable: true
  })
  delete?: SubscriptionOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [SubscriptionOnAccountWhereUniqueInput], {
    nullable: true
  })
  connect?: SubscriptionOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [SubscriptionOnAccountUpdateWithWhereUniqueWithoutAccountInput], {
    nullable: true
  })
  update?: SubscriptionOnAccountUpdateWithWhereUniqueWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [SubscriptionOnAccountUpdateManyWithWhereWithoutAccountInput], {
    nullable: true
  })
  updateMany?: SubscriptionOnAccountUpdateManyWithWhereWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [SubscriptionOnAccountScalarWhereInput], {
    nullable: true
  })
  deleteMany?: SubscriptionOnAccountScalarWhereInput[] | undefined;
}
