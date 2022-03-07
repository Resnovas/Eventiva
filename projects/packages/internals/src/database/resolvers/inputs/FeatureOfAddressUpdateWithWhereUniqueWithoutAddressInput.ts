import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureOfAddressUpdateWithoutAddressInput } from '../inputs/FeatureOfAddressUpdateWithoutAddressInput';
import { FeatureOfAddressWhereUniqueInput } from '../inputs/FeatureOfAddressWhereUniqueInput';

@TypeGraphQL.InputType(
  'FeatureOfAddressUpdateWithWhereUniqueWithoutAddressInput',
  {
    isAbstract: true,
  }
)
export class FeatureOfAddressUpdateWithWhereUniqueWithoutAddressInput {
  @TypeGraphQL.Field((_type) => FeatureOfAddressWhereUniqueInput, {
    nullable: false,
  })
  where!: FeatureOfAddressWhereUniqueInput;

  @TypeGraphQL.Field((_type) => FeatureOfAddressUpdateWithoutAddressInput, {
    nullable: false,
  })
  data!: FeatureOfAddressUpdateWithoutAddressInput;
}
