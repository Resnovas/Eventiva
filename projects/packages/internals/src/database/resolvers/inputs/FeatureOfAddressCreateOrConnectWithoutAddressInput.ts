import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureOfAddressCreateWithoutAddressInput } from '../inputs/FeatureOfAddressCreateWithoutAddressInput';
import { FeatureOfAddressWhereUniqueInput } from '../inputs/FeatureOfAddressWhereUniqueInput';

@TypeGraphQL.InputType('FeatureOfAddressCreateOrConnectWithoutAddressInput', {
  isAbstract: true,
})
export class FeatureOfAddressCreateOrConnectWithoutAddressInput {
  @TypeGraphQL.Field((_type) => FeatureOfAddressWhereUniqueInput, {
    nullable: false,
  })
  where!: FeatureOfAddressWhereUniqueInput;

  @TypeGraphQL.Field((_type) => FeatureOfAddressCreateWithoutAddressInput, {
    nullable: false,
  })
  create!: FeatureOfAddressCreateWithoutAddressInput;
}
