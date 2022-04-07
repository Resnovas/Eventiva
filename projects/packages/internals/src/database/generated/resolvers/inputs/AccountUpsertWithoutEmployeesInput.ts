import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateWithoutEmployeesInput } from "../inputs/AccountCreateWithoutEmployeesInput";
import { AccountUpdateWithoutEmployeesInput } from "../inputs/AccountUpdateWithoutEmployeesInput";

@TypeGraphQL.InputType("AccountUpsertWithoutEmployeesInput", {
  isAbstract: true
})
export class AccountUpsertWithoutEmployeesInput {
  @TypeGraphQL.Field(_type => AccountUpdateWithoutEmployeesInput, {
    nullable: false
  })
  update!: AccountUpdateWithoutEmployeesInput;

  @TypeGraphQL.Field(_type => AccountCreateWithoutEmployeesInput, {
    nullable: false
  })
  create!: AccountCreateWithoutEmployeesInput;
}
