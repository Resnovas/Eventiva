import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateWithoutSaltInput } from "../inputs/AccountCreateWithoutSaltInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountCreateOrConnectWithoutSaltInput", {
  isAbstract: true
})
export class AccountCreateOrConnectWithoutSaltInput {
  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: false
  })
  where!: AccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => AccountCreateWithoutSaltInput, {
    nullable: false
  })
  create!: AccountCreateWithoutSaltInput;
}
