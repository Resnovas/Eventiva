import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateWithoutSaltInput } from "../inputs/AccountCreateWithoutSaltInput";
import { AccountUpdateWithoutSaltInput } from "../inputs/AccountUpdateWithoutSaltInput";

@TypeGraphQL.InputType("AccountUpsertWithoutSaltInput", {
  isAbstract: true
})
export class AccountUpsertWithoutSaltInput {
  @TypeGraphQL.Field(_type => AccountUpdateWithoutSaltInput, {
    nullable: false
  })
  update!: AccountUpdateWithoutSaltInput;

  @TypeGraphQL.Field(_type => AccountCreateWithoutSaltInput, {
    nullable: false
  })
  create!: AccountCreateWithoutSaltInput;
}
