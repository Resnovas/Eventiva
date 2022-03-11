import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateNestedOneWithoutEmployerInput } from "../inputs/AccountCreateNestedOneWithoutEmployerInput";

@TypeGraphQL.InputType("EmployersOnAccountCreateWithoutEmployerInput", {
  isAbstract: true
})
export class EmployersOnAccountCreateWithoutEmployerInput {
  @TypeGraphQL.Field(_type => AccountCreateNestedOneWithoutEmployerInput, {
    nullable: false
  })
  account!: AccountCreateNestedOneWithoutEmployerInput;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  updatedAt?: Date | undefined;
}
