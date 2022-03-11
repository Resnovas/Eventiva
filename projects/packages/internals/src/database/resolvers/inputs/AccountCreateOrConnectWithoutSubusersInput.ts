import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateWithoutSubusersInput } from "../inputs/AccountCreateWithoutSubusersInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountCreateOrConnectWithoutSubusersInput", {
  isAbstract: true
})
export class AccountCreateOrConnectWithoutSubusersInput {
  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: false
  })
  where!: AccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => AccountCreateWithoutSubusersInput, {
    nullable: false
  })
  create!: AccountCreateWithoutSubusersInput;
}
