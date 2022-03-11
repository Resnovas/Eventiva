import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateNestedOneWithoutManagersInput } from "../inputs/AccountCreateNestedOneWithoutManagersInput";

@TypeGraphQL.InputType("ManagersOnAccountCreateWithoutAccountInput", {
  isAbstract: true
})
export class ManagersOnAccountCreateWithoutAccountInput {
  @TypeGraphQL.Field(_type => AccountCreateNestedOneWithoutManagersInput, {
    nullable: false
  })
  managers!: AccountCreateNestedOneWithoutManagersInput;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  updatedAt?: Date | undefined;
}
