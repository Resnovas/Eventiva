import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateWithoutPhonesInput } from "../inputs/AccountCreateWithoutPhonesInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountCreateOrConnectWithoutPhonesInput", {
  isAbstract: true
})
export class AccountCreateOrConnectWithoutPhonesInput {
  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: false
  })
  where!: AccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => AccountCreateWithoutPhonesInput, {
    nullable: false
  })
  create!: AccountCreateWithoutPhonesInput;
}
