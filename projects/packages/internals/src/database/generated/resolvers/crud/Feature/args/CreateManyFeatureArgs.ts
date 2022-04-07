import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { FeatureCreateManyInput } from "../../../inputs/FeatureCreateManyInput";

@TypeGraphQL.ArgsType()
export class CreateManyFeatureArgs {
  @TypeGraphQL.Field(_type => [FeatureCreateManyInput], {
    nullable: false
  })
  data!: FeatureCreateManyInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
