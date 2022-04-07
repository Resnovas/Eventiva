import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateNestedOneWithoutAccountsInput } from "../inputs/AccountCreateNestedOneWithoutAccountsInput";
import { AccountCreateNestedOneWithoutManagersInput } from "../inputs/AccountCreateNestedOneWithoutManagersInput";

@TypeGraphQL.InputType("ManagersOnAccountCreateInput", {
  isAbstract: true
})
export class ManagersOnAccountCreateInput {
  @TypeGraphQL.Field(_type => AccountCreateNestedOneWithoutAccountsInput, {
    nullable: false
  })
  account!: AccountCreateNestedOneWithoutAccountsInput;

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

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deletedDate?: Date | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  deleted?: boolean | undefined;
}
