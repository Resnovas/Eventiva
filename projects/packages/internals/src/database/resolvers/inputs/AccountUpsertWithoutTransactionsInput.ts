import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateWithoutTransactionsInput } from "../inputs/AccountCreateWithoutTransactionsInput";
import { AccountUpdateWithoutTransactionsInput } from "../inputs/AccountUpdateWithoutTransactionsInput";

@TypeGraphQL.InputType("AccountUpsertWithoutTransactionsInput", {
  isAbstract: true
})
export class AccountUpsertWithoutTransactionsInput {
  @TypeGraphQL.Field(_type => AccountUpdateWithoutTransactionsInput, {
    nullable: false
  })
  update!: AccountUpdateWithoutTransactionsInput;

  @TypeGraphQL.Field(_type => AccountCreateWithoutTransactionsInput, {
    nullable: false
  })
  create!: AccountCreateWithoutTransactionsInput;
}
