import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { AccountCreateManyInput } from "../../../inputs/AccountCreateManyInput";

@TypeGraphQL.ArgsType()
export class CreateManyAccountArgs {
  @TypeGraphQL.Field(_type => [AccountCreateManyInput], {
    nullable: false
  })
  data!: AccountCreateManyInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
