import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateWithoutAddressesInput } from "../inputs/AccountCreateWithoutAddressesInput";
import { AccountUpdateWithoutAddressesInput } from "../inputs/AccountUpdateWithoutAddressesInput";

@TypeGraphQL.InputType("AccountUpsertWithoutAddressesInput", {
  isAbstract: true
})
export class AccountUpsertWithoutAddressesInput {
  @TypeGraphQL.Field(_type => AccountUpdateWithoutAddressesInput, {
    nullable: false
  })
  update!: AccountUpdateWithoutAddressesInput;

  @TypeGraphQL.Field(_type => AccountCreateWithoutAddressesInput, {
    nullable: false
  })
  create!: AccountCreateWithoutAddressesInput;
}
