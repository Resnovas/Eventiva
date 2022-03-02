import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { FeatureOfAddressWhereUniqueInput } from '../../../inputs/FeatureOfAddressWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class DeleteFeatureOfAddressArgs {
  @TypeGraphQL.Field((_type) => FeatureOfAddressWhereUniqueInput, {
    nullable: false,
  })
  where!: FeatureOfAddressWhereUniqueInput;
}
