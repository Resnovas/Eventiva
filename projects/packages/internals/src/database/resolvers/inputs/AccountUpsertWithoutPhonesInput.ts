import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateWithoutPhonesInput } from "../inputs/AccountCreateWithoutPhonesInput";
import { AccountUpdateWithoutPhonesInput } from "../inputs/AccountUpdateWithoutPhonesInput";

@TypeGraphQL.InputType("AccountUpsertWithoutPhonesInput", {
  isAbstract: true
})
export class AccountUpsertWithoutPhonesInput {
  @TypeGraphQL.Field(_type => AccountUpdateWithoutPhonesInput, {
    nullable: false
  })
  update!: AccountUpdateWithoutPhonesInput;

  @TypeGraphQL.Field(_type => AccountCreateWithoutPhonesInput, {
    nullable: false
  })
  create!: AccountCreateWithoutPhonesInput;
}
