import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { FeatureCreateInput } from "../../../inputs/FeatureCreateInput";

@TypeGraphQL.ArgsType()
export class CreateFeatureArgs {
  @TypeGraphQL.Field(_type => FeatureCreateInput, {
    nullable: false
  })
  data!: FeatureCreateInput;
}
