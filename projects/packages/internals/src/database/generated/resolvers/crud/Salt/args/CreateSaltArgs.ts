import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SaltCreateInput } from "../../../inputs/SaltCreateInput";

@TypeGraphQL.ArgsType()
export class CreateSaltArgs {
  @TypeGraphQL.Field(_type => SaltCreateInput, {
    nullable: false
  })
  data!: SaltCreateInput;
}
