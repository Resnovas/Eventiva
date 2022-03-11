import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { TokenCreateManyInput } from "../../../inputs/TokenCreateManyInput";

@TypeGraphQL.ArgsType()
export class CreateManyTokenArgs {
  @TypeGraphQL.Field(_type => [TokenCreateManyInput], {
    nullable: false
  })
  data!: TokenCreateManyInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
