import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EmailCreateInput } from "../../../inputs/EmailCreateInput";
import { EmailUpdateInput } from "../../../inputs/EmailUpdateInput";
import { EmailWhereUniqueInput } from "../../../inputs/EmailWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpsertEmailArgs {
  @TypeGraphQL.Field(_type => EmailWhereUniqueInput, {
    nullable: false
  })
  where!: EmailWhereUniqueInput;

  @TypeGraphQL.Field(_type => EmailCreateInput, {
    nullable: false
  })
  create!: EmailCreateInput;

  @TypeGraphQL.Field(_type => EmailUpdateInput, {
    nullable: false
  })
  update!: EmailUpdateInput;
}
