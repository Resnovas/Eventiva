import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { FeatureOfAddressUpdateInput } from '../../../inputs/FeatureOfAddressUpdateInput';
import { FeatureOfAddressWhereUniqueInput } from '../../../inputs/FeatureOfAddressWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpdateFeatureOfAddressArgs {
  @TypeGraphQL.Field((_type) => FeatureOfAddressUpdateInput, {
    nullable: false,
  })
  data!: FeatureOfAddressUpdateInput;

  @TypeGraphQL.Field((_type) => FeatureOfAddressWhereUniqueInput, {
    nullable: false,
  })
  where!: FeatureOfAddressWhereUniqueInput;
}
