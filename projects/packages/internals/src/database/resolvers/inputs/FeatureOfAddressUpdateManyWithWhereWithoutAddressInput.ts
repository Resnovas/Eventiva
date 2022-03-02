import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureOfAddressScalarWhereInput } from '../inputs/FeatureOfAddressScalarWhereInput';
import { FeatureOfAddressUpdateManyMutationInput } from '../inputs/FeatureOfAddressUpdateManyMutationInput';

@TypeGraphQL.InputType(
  'FeatureOfAddressUpdateManyWithWhereWithoutAddressInput',
  {
    isAbstract: true,
  }
)
export class FeatureOfAddressUpdateManyWithWhereWithoutAddressInput {
  @TypeGraphQL.Field((_type) => FeatureOfAddressScalarWhereInput, {
    nullable: false,
  })
  where!: FeatureOfAddressScalarWhereInput;

  @TypeGraphQL.Field((_type) => FeatureOfAddressUpdateManyMutationInput, {
    nullable: false,
  })
  data!: FeatureOfAddressUpdateManyMutationInput;
}
