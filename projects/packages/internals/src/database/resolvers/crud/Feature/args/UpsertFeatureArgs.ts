import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { FeatureCreateInput } from "../../../inputs/FeatureCreateInput";
import { FeatureUpdateInput } from "../../../inputs/FeatureUpdateInput";
import { FeatureWhereUniqueInput } from "../../../inputs/FeatureWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpsertFeatureArgs {
  @TypeGraphQL.Field(_type => FeatureWhereUniqueInput, {
    nullable: false
  })
  where!: FeatureWhereUniqueInput;

  @TypeGraphQL.Field(_type => FeatureCreateInput, {
    nullable: false
  })
  create!: FeatureCreateInput;

  @TypeGraphQL.Field(_type => FeatureUpdateInput, {
    nullable: false
  })
  update!: FeatureUpdateInput;
}
