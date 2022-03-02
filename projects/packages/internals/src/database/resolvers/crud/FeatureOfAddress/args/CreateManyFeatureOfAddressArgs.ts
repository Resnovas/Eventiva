import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { FeatureOfAddressCreateManyInput } from '../../../inputs/FeatureOfAddressCreateManyInput';

@TypeGraphQL.ArgsType()
export class CreateManyFeatureOfAddressArgs {
  @TypeGraphQL.Field((_type) => [FeatureOfAddressCreateManyInput], {
    nullable: false,
  })
  data!: FeatureOfAddressCreateManyInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
