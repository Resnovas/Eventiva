import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { SIACheckCreateWithoutTransactionsInput } from "../inputs/SIACheckCreateWithoutTransactionsInput";
import { SIACheckUpdateWithoutTransactionsInput } from "../inputs/SIACheckUpdateWithoutTransactionsInput";
import { SIACheckWhereUniqueInput } from "../inputs/SIACheckWhereUniqueInput";

@TypeGraphQL.InputType("SIACheckUpsertWithWhereUniqueWithoutTransactionsInput", {
  isAbstract: true
})
export class SIACheckUpsertWithWhereUniqueWithoutTransactionsInput {
  @TypeGraphQL.Field(_type => SIACheckWhereUniqueInput, {
    nullable: false
  })
  where!: SIACheckWhereUniqueInput;

  @TypeGraphQL.Field(_type => SIACheckUpdateWithoutTransactionsInput, {
    nullable: false
  })
  update!: SIACheckUpdateWithoutTransactionsInput;

  @TypeGraphQL.Field(_type => SIACheckCreateWithoutTransactionsInput, {
    nullable: false
  })
  create!: SIACheckCreateWithoutTransactionsInput;
}
