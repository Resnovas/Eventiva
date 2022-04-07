import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { FeatureOfAddressCreateInput } from "../../../inputs/FeatureOfAddressCreateInput";
import { FeatureOfAddressUpdateInput } from "../../../inputs/FeatureOfAddressUpdateInput";
import { FeatureOfAddressWhereUniqueInput } from "../../../inputs/FeatureOfAddressWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpsertFeatureOfAddressArgs {
  @TypeGraphQL.Field(_type => FeatureOfAddressWhereUniqueInput, {
    nullable: false
  })
  where!: FeatureOfAddressWhereUniqueInput;

  @TypeGraphQL.Field(_type => FeatureOfAddressCreateInput, {
    nullable: false
  })
  create!: FeatureOfAddressCreateInput;

  @TypeGraphQL.Field(_type => FeatureOfAddressUpdateInput, {
    nullable: false
  })
  update!: FeatureOfAddressUpdateInput;
}
