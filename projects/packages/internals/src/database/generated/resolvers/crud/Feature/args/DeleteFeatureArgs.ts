import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { FeatureWhereUniqueInput } from "../../../inputs/FeatureWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class DeleteFeatureArgs {
  @TypeGraphQL.Field(_type => FeatureWhereUniqueInput, {
    nullable: false
  })
  where!: FeatureWhereUniqueInput;
}
