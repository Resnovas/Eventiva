import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateNestedOneWithoutEmployeesInput } from "../inputs/AccountCreateNestedOneWithoutEmployeesInput";

@TypeGraphQL.InputType("EmployersOnAccountCreateWithoutAccountInput", {
  isAbstract: true
})
export class EmployersOnAccountCreateWithoutAccountInput {
  @TypeGraphQL.Field(_type => AccountCreateNestedOneWithoutEmployeesInput, {
    nullable: false
  })
  employer!: AccountCreateNestedOneWithoutEmployeesInput;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  updatedAt?: Date | undefined;
}
