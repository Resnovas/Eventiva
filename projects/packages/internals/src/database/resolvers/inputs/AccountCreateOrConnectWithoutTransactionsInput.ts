import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateWithoutTransactionsInput } from "../inputs/AccountCreateWithoutTransactionsInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountCreateOrConnectWithoutTransactionsInput", {
  isAbstract: true
})
export class AccountCreateOrConnectWithoutTransactionsInput {
  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: false
  })
  where!: AccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => AccountCreateWithoutTransactionsInput, {
    nullable: false
  })
  create!: AccountCreateWithoutTransactionsInput;
}
