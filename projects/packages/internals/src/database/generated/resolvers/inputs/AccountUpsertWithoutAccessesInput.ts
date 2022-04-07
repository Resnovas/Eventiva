import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateWithoutAccessesInput } from "../inputs/AccountCreateWithoutAccessesInput";
import { AccountUpdateWithoutAccessesInput } from "../inputs/AccountUpdateWithoutAccessesInput";

@TypeGraphQL.InputType("AccountUpsertWithoutAccessesInput", {
  isAbstract: true
})
export class AccountUpsertWithoutAccessesInput {
  @TypeGraphQL.Field(_type => AccountUpdateWithoutAccessesInput, {
    nullable: false
  })
  update!: AccountUpdateWithoutAccessesInput;

  @TypeGraphQL.Field(_type => AccountCreateWithoutAccessesInput, {
    nullable: false
  })
  create!: AccountCreateWithoutAccessesInput;
}
