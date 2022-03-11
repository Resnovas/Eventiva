import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SubscriptionCreateOrConnectWithoutAccountsInput } from "../inputs/SubscriptionCreateOrConnectWithoutAccountsInput";
import { SubscriptionCreateWithoutAccountsInput } from "../inputs/SubscriptionCreateWithoutAccountsInput";
import { SubscriptionWhereUniqueInput } from "../inputs/SubscriptionWhereUniqueInput";

@TypeGraphQL.InputType("SubscriptionCreateNestedOneWithoutAccountsInput", {
  isAbstract: true
})
export class SubscriptionCreateNestedOneWithoutAccountsInput {
  @TypeGraphQL.Field(_type => SubscriptionCreateWithoutAccountsInput, {
    nullable: true
  })
  create?: SubscriptionCreateWithoutAccountsInput | undefined;

  @TypeGraphQL.Field(_type => SubscriptionCreateOrConnectWithoutAccountsInput, {
    nullable: true
  })
  connectOrCreate?: SubscriptionCreateOrConnectWithoutAccountsInput | undefined;

  @TypeGraphQL.Field(_type => SubscriptionWhereUniqueInput, {
    nullable: true
  })
  connect?: SubscriptionWhereUniqueInput | undefined;
}
