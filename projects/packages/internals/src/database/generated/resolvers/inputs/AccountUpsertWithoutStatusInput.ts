import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateWithoutStatusInput } from "../inputs/AccountCreateWithoutStatusInput";
import { AccountUpdateWithoutStatusInput } from "../inputs/AccountUpdateWithoutStatusInput";

@TypeGraphQL.InputType("AccountUpsertWithoutStatusInput", {
  isAbstract: true
})
export class AccountUpsertWithoutStatusInput {
  @TypeGraphQL.Field(_type => AccountUpdateWithoutStatusInput, {
    nullable: false
  })
  update!: AccountUpdateWithoutStatusInput;

  @TypeGraphQL.Field(_type => AccountCreateWithoutStatusInput, {
    nullable: false
  })
  create!: AccountCreateWithoutStatusInput;
}
