import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateWithoutSubscriptionInput } from "../inputs/AccountCreateWithoutSubscriptionInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountCreateOrConnectWithoutSubscriptionInput", {
  isAbstract: true
})
export class AccountCreateOrConnectWithoutSubscriptionInput {
  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: false
  })
  where!: AccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => AccountCreateWithoutSubscriptionInput, {
    nullable: false
  })
  create!: AccountCreateWithoutSubscriptionInput;
}
