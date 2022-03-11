import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateWithoutAddressesInput } from "../inputs/AccountCreateWithoutAddressesInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountCreateOrConnectWithoutAddressesInput", {
  isAbstract: true
})
export class AccountCreateOrConnectWithoutAddressesInput {
  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: false
  })
  where!: AccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => AccountCreateWithoutAddressesInput, {
    nullable: false
  })
  create!: AccountCreateWithoutAddressesInput;
}
