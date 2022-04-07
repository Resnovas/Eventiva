import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateWithoutStatusInput } from "../inputs/AccountCreateWithoutStatusInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountCreateOrConnectWithoutStatusInput", {
  isAbstract: true
})
export class AccountCreateOrConnectWithoutStatusInput {
  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: false
  })
  where!: AccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => AccountCreateWithoutStatusInput, {
    nullable: false
  })
  create!: AccountCreateWithoutStatusInput;
}
