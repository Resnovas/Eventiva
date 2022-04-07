import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SubscriptionOnAccountCreateManyAccountInputEnvelope } from "../inputs/SubscriptionOnAccountCreateManyAccountInputEnvelope";
import { SubscriptionOnAccountCreateOrConnectWithoutAccountInput } from "../inputs/SubscriptionOnAccountCreateOrConnectWithoutAccountInput";
import { SubscriptionOnAccountCreateWithoutAccountInput } from "../inputs/SubscriptionOnAccountCreateWithoutAccountInput";
import { SubscriptionOnAccountWhereUniqueInput } from "../inputs/SubscriptionOnAccountWhereUniqueInput";

@TypeGraphQL.InputType("SubscriptionOnAccountCreateNestedManyWithoutAccountInput", {
  isAbstract: true
})
export class SubscriptionOnAccountCreateNestedManyWithoutAccountInput {
  @TypeGraphQL.Field(_type => [SubscriptionOnAccountCreateWithoutAccountInput], {
    nullable: true
  })
  create?: SubscriptionOnAccountCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => [SubscriptionOnAccountCreateOrConnectWithoutAccountInput], {
    nullable: true
  })
  connectOrCreate?: SubscriptionOnAccountCreateOrConnectWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(_type => SubscriptionOnAccountCreateManyAccountInputEnvelope, {
    nullable: true
  })
  createMany?: SubscriptionOnAccountCreateManyAccountInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [SubscriptionOnAccountWhereUniqueInput], {
    nullable: true
  })
  connect?: SubscriptionOnAccountWhereUniqueInput[] | undefined;
}
