import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountCreateNestedOneWithoutTransactionsInput } from "../inputs/AccountCreateNestedOneWithoutTransactionsInput";
import { SIACheckCreateNestedManyWithoutTransactionsInput } from "../inputs/SIACheckCreateNestedManyWithoutTransactionsInput";

@TypeGraphQL.InputType("TransactionCreateInput", {
  isAbstract: true
})
export class TransactionCreateInput {
  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  id?: string | undefined;

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
  deleted?: Date | undefined;

  @TypeGraphQL.Field(_type => AccountCreateNestedOneWithoutTransactionsInput, {
    nullable: false
  })
  account!: AccountCreateNestedOneWithoutTransactionsInput;

  @TypeGraphQL.Field(_type => SIACheckCreateNestedManyWithoutTransactionsInput, {
    nullable: true
  })
  SIACheck?: SIACheckCreateNestedManyWithoutTransactionsInput | undefined;

  @TypeGraphQL.Field(_type => GraphQLScalars.JSONResolver, {
    nullable: false
  })
  data!: Prisma.InputJsonValue;
}
