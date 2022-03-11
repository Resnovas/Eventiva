import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EmailUpdateInput } from "../../../inputs/EmailUpdateInput";
import { EmailWhereUniqueInput } from "../../../inputs/EmailWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateEmailArgs {
  @TypeGraphQL.Field(_type => EmailUpdateInput, {
    nullable: false
  })
  data!: EmailUpdateInput;

  @TypeGraphQL.Field(_type => EmailWhereUniqueInput, {
    nullable: false
  })
  where!: EmailWhereUniqueInput;
}
