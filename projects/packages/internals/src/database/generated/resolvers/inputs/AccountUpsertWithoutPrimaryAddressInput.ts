import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateWithoutPrimaryAddressInput } from "../inputs/AccountCreateWithoutPrimaryAddressInput";
import { AccountUpdateWithoutPrimaryAddressInput } from "../inputs/AccountUpdateWithoutPrimaryAddressInput";

@TypeGraphQL.InputType("AccountUpsertWithoutPrimaryAddressInput", {
  isAbstract: true
})
export class AccountUpsertWithoutPrimaryAddressInput {
  @TypeGraphQL.Field(_type => AccountUpdateWithoutPrimaryAddressInput, {
    nullable: false
  })
  update!: AccountUpdateWithoutPrimaryAddressInput;

  @TypeGraphQL.Field(_type => AccountCreateWithoutPrimaryAddressInput, {
    nullable: false
  })
  create!: AccountCreateWithoutPrimaryAddressInput;
}
