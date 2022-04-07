import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { TransactionCreateWithoutAccountInput } from "../inputs/TransactionCreateWithoutAccountInput";
import { TransactionWhereUniqueInput } from "../inputs/TransactionWhereUniqueInput";

@TypeGraphQL.InputType("TransactionCreateOrConnectWithoutAccountInput", {
  isAbstract: true
})
export class TransactionCreateOrConnectWithoutAccountInput {
  @TypeGraphQL.Field(_type => TransactionWhereUniqueInput, {
    nullable: false
  })
  where!: TransactionWhereUniqueInput;

  @TypeGraphQL.Field(_type => TransactionCreateWithoutAccountInput, {
    nullable: false
  })
  create!: TransactionCreateWithoutAccountInput;
}
