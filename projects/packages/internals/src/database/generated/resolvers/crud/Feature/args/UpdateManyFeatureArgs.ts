import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { FeatureUpdateManyMutationInput } from "../../../inputs/FeatureUpdateManyMutationInput";
import { FeatureWhereInput } from "../../../inputs/FeatureWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyFeatureArgs {
  @TypeGraphQL.Field(_type => FeatureUpdateManyMutationInput, {
    nullable: false
  })
  data!: FeatureUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => FeatureWhereInput, {
    nullable: true
  })
  where?: FeatureWhereInput | undefined;
}
