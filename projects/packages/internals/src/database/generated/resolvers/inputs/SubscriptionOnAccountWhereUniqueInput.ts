import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SubscriptionOnAccountAccountIdSubscriptionIdCompoundUniqueInput } from "../inputs/SubscriptionOnAccountAccountIdSubscriptionIdCompoundUniqueInput";

@TypeGraphQL.InputType("SubscriptionOnAccountWhereUniqueInput", {
  isAbstract: true
})
export class SubscriptionOnAccountWhereUniqueInput {
  @TypeGraphQL.Field(_type => SubscriptionOnAccountAccountIdSubscriptionIdCompoundUniqueInput, {
    nullable: true
  })
  accountId_subscriptionId?: SubscriptionOnAccountAccountIdSubscriptionIdCompoundUniqueInput | undefined;
}
