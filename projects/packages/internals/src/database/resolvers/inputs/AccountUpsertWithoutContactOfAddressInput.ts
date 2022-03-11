import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateWithoutContactOfAddressInput } from "../inputs/AccountCreateWithoutContactOfAddressInput";
import { AccountUpdateWithoutContactOfAddressInput } from "../inputs/AccountUpdateWithoutContactOfAddressInput";

@TypeGraphQL.InputType("AccountUpsertWithoutContactOfAddressInput", {
  isAbstract: true
})
export class AccountUpsertWithoutContactOfAddressInput {
  @TypeGraphQL.Field(_type => AccountUpdateWithoutContactOfAddressInput, {
    nullable: false
  })
  update!: AccountUpdateWithoutContactOfAddressInput;

  @TypeGraphQL.Field(_type => AccountCreateWithoutContactOfAddressInput, {
    nullable: false
  })
  create!: AccountCreateWithoutContactOfAddressInput;
}
