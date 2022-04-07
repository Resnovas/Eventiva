import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ArrangementCreateInput } from "../../../inputs/ArrangementCreateInput";

@TypeGraphQL.ArgsType()
export class CreateArrangementArgs {
  @TypeGraphQL.Field(_type => ArrangementCreateInput, {
    nullable: false
  })
  data!: ArrangementCreateInput;
}
