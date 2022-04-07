import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SubscriptionOnAccountCreateManySubscriptionInputEnvelope } from "../inputs/SubscriptionOnAccountCreateManySubscriptionInputEnvelope";
import { SubscriptionOnAccountCreateOrConnectWithoutSubscriptionInput } from "../inputs/SubscriptionOnAccountCreateOrConnectWithoutSubscriptionInput";
import { SubscriptionOnAccountCreateWithoutSubscriptionInput } from "../inputs/SubscriptionOnAccountCreateWithoutSubscriptionInput";
import { SubscriptionOnAccountWhereUniqueInput } from "../inputs/SubscriptionOnAccountWhereUniqueInput";

@TypeGraphQL.InputType("SubscriptionOnAccountCreateNestedManyWithoutSubscriptionInput", {
  isAbstract: true
})
export class SubscriptionOnAccountCreateNestedManyWithoutSubscriptionInput {
  @TypeGraphQL.Field(_type => [SubscriptionOnAccountCreateWithoutSubscriptionInput], {
    nullable: true
  })
  create?: SubscriptionOnAccountCreateWithoutSubscriptionInput[] | undefined;

  @TypeGraphQL.Field(_type => [SubscriptionOnAccountCreateOrConnectWithoutSubscriptionInput], {
    nullable: true
  })
  connectOrCreate?: SubscriptionOnAccountCreateOrConnectWithoutSubscriptionInput[] | undefined;

  @TypeGraphQL.Field(_type => SubscriptionOnAccountCreateManySubscriptionInputEnvelope, {
    nullable: true
  })
  createMany?: SubscriptionOnAccountCreateManySubscriptionInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [SubscriptionOnAccountWhereUniqueInput], {
    nullable: true
  })
  connect?: SubscriptionOnAccountWhereUniqueInput[] | undefined;
}
