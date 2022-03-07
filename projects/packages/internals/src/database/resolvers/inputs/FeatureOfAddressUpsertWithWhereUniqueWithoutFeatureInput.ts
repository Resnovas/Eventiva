import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureOfAddressCreateWithoutFeatureInput } from '../inputs/FeatureOfAddressCreateWithoutFeatureInput';
import { FeatureOfAddressUpdateWithoutFeatureInput } from '../inputs/FeatureOfAddressUpdateWithoutFeatureInput';
import { FeatureOfAddressWhereUniqueInput } from '../inputs/FeatureOfAddressWhereUniqueInput';

@TypeGraphQL.InputType(
  'FeatureOfAddressUpsertWithWhereUniqueWithoutFeatureInput',
  {
    isAbstract: true,
  }
)
export class FeatureOfAddressUpsertWithWhereUniqueWithoutFeatureInput {
  @TypeGraphQL.Field((_type) => FeatureOfAddressWhereUniqueInput, {
    nullable: false,
  })
  where!: FeatureOfAddressWhereUniqueInput;

  @TypeGraphQL.Field((_type) => FeatureOfAddressUpdateWithoutFeatureInput, {
    nullable: false,
  })
  update!: FeatureOfAddressUpdateWithoutFeatureInput;

  @TypeGraphQL.Field((_type) => FeatureOfAddressCreateWithoutFeatureInput, {
    nullable: false,
  })
  create!: FeatureOfAddressCreateWithoutFeatureInput;
}
