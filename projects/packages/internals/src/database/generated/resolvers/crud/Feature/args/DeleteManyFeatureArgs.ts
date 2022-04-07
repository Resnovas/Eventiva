import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { FeatureWhereInput } from "../../../inputs/FeatureWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyFeatureArgs {
  @TypeGraphQL.Field(_type => FeatureWhereInput, {
    nullable: true
  })
  where?: FeatureWhereInput | undefined;
}
