import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateWithoutAccessesInput } from "../inputs/AccountCreateWithoutAccessesInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountCreateOrConnectWithoutAccessesInput", {
  isAbstract: true
})
export class AccountCreateOrConnectWithoutAccessesInput {
  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: false
  })
  where!: AccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => AccountCreateWithoutAccessesInput, {
    nullable: false
  })
  create!: AccountCreateWithoutAccessesInput;
}
