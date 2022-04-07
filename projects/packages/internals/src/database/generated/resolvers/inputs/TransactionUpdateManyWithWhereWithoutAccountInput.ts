import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { TransactionScalarWhereInput } from "../inputs/TransactionScalarWhereInput";
import { TransactionUpdateManyMutationInput } from "../inputs/TransactionUpdateManyMutationInput";

@TypeGraphQL.InputType("TransactionUpdateManyWithWhereWithoutAccountInput", {
  isAbstract: true
})
export class TransactionUpdateManyWithWhereWithoutAccountInput {
  @TypeGraphQL.Field(_type => TransactionScalarWhereInput, {
    nullable: false
  })
  where!: TransactionScalarWhereInput;

  @TypeGraphQL.Field(_type => TransactionUpdateManyMutationInput, {
    nullable: false
  })
  data!: TransactionUpdateManyMutationInput;
}
