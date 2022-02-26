import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { FeatureOfAddressWhereInput } from '../../../inputs/FeatureOfAddressWhereInput';

@TypeGraphQL.ArgsType()
export class DeleteManyFeatureOfAddressArgs {
  @TypeGraphQL.Field((_type) => FeatureOfAddressWhereInput, {
    nullable: true,
  })
  where?: FeatureOfAddressWhereInput | undefined;
}
