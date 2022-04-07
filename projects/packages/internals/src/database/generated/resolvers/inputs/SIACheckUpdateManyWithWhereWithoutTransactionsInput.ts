import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SIACheckScalarWhereInput } from "../inputs/SIACheckScalarWhereInput";
import { SIACheckUpdateManyMutationInput } from "../inputs/SIACheckUpdateManyMutationInput";

@TypeGraphQL.InputType("SIACheckUpdateManyWithWhereWithoutTransactionsInput", {
  isAbstract: true
})
export class SIACheckUpdateManyWithWhereWithoutTransactionsInput {
  @TypeGraphQL.Field(_type => SIACheckScalarWhereInput, {
    nullable: false
  })
  where!: SIACheckScalarWhereInput;

  @TypeGraphQL.Field(_type => SIACheckUpdateManyMutationInput, {
    nullable: false
  })
  data!: SIACheckUpdateManyMutationInput;
}
