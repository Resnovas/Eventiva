import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateWithoutApplicationInput } from "../inputs/AccountCreateWithoutApplicationInput";
import { AccountUpdateWithoutApplicationInput } from "../inputs/AccountUpdateWithoutApplicationInput";

@TypeGraphQL.InputType("AccountUpsertWithoutApplicationInput", {
  isAbstract: true
})
export class AccountUpsertWithoutApplicationInput {
  @TypeGraphQL.Field(_type => AccountUpdateWithoutApplicationInput, {
    nullable: false
  })
  update!: AccountUpdateWithoutApplicationInput;

  @TypeGraphQL.Field(_type => AccountCreateWithoutApplicationInput, {
    nullable: false
  })
  create!: AccountCreateWithoutApplicationInput;
}
