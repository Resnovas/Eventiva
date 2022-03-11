import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateWithoutContactOfAddressInput } from "../inputs/AccountCreateWithoutContactOfAddressInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountCreateOrConnectWithoutContactOfAddressInput", {
  isAbstract: true
})
export class AccountCreateOrConnectWithoutContactOfAddressInput {
  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: false
  })
  where!: AccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => AccountCreateWithoutContactOfAddressInput, {
    nullable: false
  })
  create!: AccountCreateWithoutContactOfAddressInput;
}
