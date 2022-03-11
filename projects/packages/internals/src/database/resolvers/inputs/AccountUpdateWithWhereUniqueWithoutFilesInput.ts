import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { AccountUpdateWithoutFilesInput } from "../inputs/AccountUpdateWithoutFilesInput";
import { AccountWhereUniqueInput } from "../inputs/AccountWhereUniqueInput";

@TypeGraphQL.InputType("AccountUpdateWithWhereUniqueWithoutFilesInput", {
  isAbstract: true
})
export class AccountUpdateWithWhereUniqueWithoutFilesInput {
  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: false
  })
  where!: AccountWhereUniqueInput;

  @TypeGraphQL.Field(_type => AccountUpdateWithoutFilesInput, {
    nullable: false
  })
  data!: AccountUpdateWithoutFilesInput;
}
