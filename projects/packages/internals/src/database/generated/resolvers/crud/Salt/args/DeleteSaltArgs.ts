import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SaltWhereUniqueInput } from "../../../inputs/SaltWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class DeleteSaltArgs {
  @TypeGraphQL.Field(_type => SaltWhereUniqueInput, {
    nullable: false
  })
  where!: SaltWhereUniqueInput;
}
