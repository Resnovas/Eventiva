import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";

@TypeGraphQL.InputType("SubscriptionOnAccountAccountIdSubscriptionIdCompoundUniqueInput", {
  isAbstract: true
})
export class SubscriptionOnAccountAccountIdSubscriptionIdCompoundUniqueInput {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  accountId!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  subscriptionId!: string;
}
