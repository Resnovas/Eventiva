import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateWithoutApiTokenInput } from "../inputs/AccountCreateWithoutApiTokenInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountCreateOrConnectWithoutApiTokenInput", {
  isAbstract: true
})
export class AccountCreateOrConnectWithoutApiTokenInput {
  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: false
  })
  where!: AccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => AccountCreateWithoutApiTokenInput, {
    nullable: false
  })
  create!: AccountCreateWithoutApiTokenInput;
}
