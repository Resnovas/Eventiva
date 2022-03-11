import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { AccountCreateInput } from "../../../inputs/AccountCreateInput";

@TypeGraphQL.ArgsType()
export class CreateAccountArgs {
  @TypeGraphQL.Field(_type => AccountCreateInput, {
    nullable: false
  })
  data!: AccountCreateInput;
}
