import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { FeatureOfAddressCreateInput } from "../../../inputs/FeatureOfAddressCreateInput";

@TypeGraphQL.ArgsType()
export class CreateFeatureOfAddressArgs {
  @TypeGraphQL.Field(_type => FeatureOfAddressCreateInput, {
    nullable: false
  })
  data!: FeatureOfAddressCreateInput;
}
