import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { FeatureOfAddressUpdateManyMutationInput } from "../../../inputs/FeatureOfAddressUpdateManyMutationInput";
import { FeatureOfAddressWhereInput } from "../../../inputs/FeatureOfAddressWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyFeatureOfAddressArgs {
  @TypeGraphQL.Field(_type => FeatureOfAddressUpdateManyMutationInput, {
    nullable: false
  })
  data!: FeatureOfAddressUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => FeatureOfAddressWhereInput, {
    nullable: true
  })
  where?: FeatureOfAddressWhereInput | undefined;
}
