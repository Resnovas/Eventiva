import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SubscriptionCreateWithoutAccountsInput } from "../inputs/SubscriptionCreateWithoutAccountsInput";
import { SubscriptionWhereUniqueInput } from "../inputs/SubscriptionWhereUniqueInput";

@TypeGraphQL.InputType("SubscriptionCreateOrConnectWithoutAccountsInput", {
  isAbstract: true
})
export class SubscriptionCreateOrConnectWithoutAccountsInput {
  @TypeGraphQL.Field(_type => SubscriptionWhereUniqueInput, {
    nullable: false
  })
  where!: SubscriptionWhereUniqueInput;

  @TypeGraphQL.Field(_type => SubscriptionCreateWithoutAccountsInput, {
    nullable: false
  })
  create!: SubscriptionCreateWithoutAccountsInput;
}
