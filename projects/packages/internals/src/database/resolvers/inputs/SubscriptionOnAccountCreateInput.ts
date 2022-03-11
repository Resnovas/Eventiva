import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateNestedOneWithoutSubscriptionInput } from "../inputs/AccountCreateNestedOneWithoutSubscriptionInput";
import { SubscriptionCreateNestedOneWithoutAccountsInput } from "../inputs/SubscriptionCreateNestedOneWithoutAccountsInput";

@TypeGraphQL.InputType("SubscriptionOnAccountCreateInput", {
  isAbstract: true
})
export class SubscriptionOnAccountCreateInput {
  @TypeGraphQL.Field(_type => SubscriptionCreateNestedOneWithoutAccountsInput, {
    nullable: false
  })
  subscription!: SubscriptionCreateNestedOneWithoutAccountsInput;

  @TypeGraphQL.Field(_type => AccountCreateNestedOneWithoutSubscriptionInput, {
    nullable: false
  })
  account!: AccountCreateNestedOneWithoutSubscriptionInput;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  active?: boolean | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deactivated?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  activated?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  startedAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  updatedAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deleted?: Date | undefined;
}
