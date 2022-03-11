import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { FeatureUpdateInput } from "../../../inputs/FeatureUpdateInput";
import { FeatureWhereUniqueInput } from "../../../inputs/FeatureWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateFeatureArgs {
  @TypeGraphQL.Field(_type => FeatureUpdateInput, {
    nullable: false
  })
  data!: FeatureUpdateInput;

  @TypeGraphQL.Field(_type => FeatureWhereUniqueInput, {
    nullable: false
  })
  where!: FeatureWhereUniqueInput;
}
