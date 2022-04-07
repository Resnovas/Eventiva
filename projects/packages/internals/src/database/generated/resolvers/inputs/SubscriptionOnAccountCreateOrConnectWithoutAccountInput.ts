import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SubscriptionOnAccountCreateWithoutAccountInput } from "../inputs/SubscriptionOnAccountCreateWithoutAccountInput";
import { SubscriptionOnAccountWhereUniqueInput } from "../inputs/SubscriptionOnAccountWhereUniqueInput";

@TypeGraphQL.InputType("SubscriptionOnAccountCreateOrConnectWithoutAccountInput", {
  isAbstract: true
})
export class SubscriptionOnAccountCreateOrConnectWithoutAccountInput {
  @TypeGraphQL.Field(_type => SubscriptionOnAccountWhereUniqueInput, {
    nullable: false
  })
  where!: SubscriptionOnAccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => SubscriptionOnAccountCreateWithoutAccountInput, {
    nullable: false
  })
  create!: SubscriptionOnAccountCreateWithoutAccountInput;
}
