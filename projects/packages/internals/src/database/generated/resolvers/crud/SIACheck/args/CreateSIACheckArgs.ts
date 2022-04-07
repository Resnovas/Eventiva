import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SIACheckCreateInput } from "../../../inputs/SIACheckCreateInput";

@TypeGraphQL.ArgsType()
export class CreateSIACheckArgs {
  @TypeGraphQL.Field(_type => SIACheckCreateInput, {
    nullable: false
  })
  data!: SIACheckCreateInput;
}
