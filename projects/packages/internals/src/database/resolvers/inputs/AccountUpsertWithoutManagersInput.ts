import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateWithoutManagersInput } from "../inputs/AccountCreateWithoutManagersInput";
import { AccountUpdateWithoutManagersInput } from "../inputs/AccountUpdateWithoutManagersInput";

@TypeGraphQL.InputType("AccountUpsertWithoutManagersInput", {
  isAbstract: true
})
export class AccountUpsertWithoutManagersInput {
  @TypeGraphQL.Field(_type => AccountUpdateWithoutManagersInput, {
    nullable: false
  })
  update!: AccountUpdateWithoutManagersInput;

  @TypeGraphQL.Field(_type => AccountCreateWithoutManagersInput, {
    nullable: false
  })
  create!: AccountCreateWithoutManagersInput;
}
