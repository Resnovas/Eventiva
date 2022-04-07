import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SIACheckCreateWithoutTransactionsInput } from "../inputs/SIACheckCreateWithoutTransactionsInput";
import { SIACheckWhereUniqueInput } from "../inputs/SIACheckWhereUniqueInput";

@TypeGraphQL.InputType("SIACheckCreateOrConnectWithoutTransactionsInput", {
  isAbstract: true
})
export class SIACheckCreateOrConnectWithoutTransactionsInput {
  @TypeGraphQL.Field(_type => SIACheckWhereUniqueInput, {
    nullable: false
  })
  where!: SIACheckWhereUniqueInput;

  @TypeGraphQL.Field(_type => SIACheckCreateWithoutTransactionsInput, {
    nullable: false
  })
  create!: SIACheckCreateWithoutTransactionsInput;
}
