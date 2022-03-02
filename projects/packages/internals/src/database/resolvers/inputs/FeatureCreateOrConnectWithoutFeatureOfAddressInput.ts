import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureCreateWithoutFeatureOfAddressInput } from '../inputs/FeatureCreateWithoutFeatureOfAddressInput';
import { FeatureWhereUniqueInput } from '../inputs/FeatureWhereUniqueInput';

@TypeGraphQL.InputType('FeatureCreateOrConnectWithoutFeatureOfAddressInput', {
  isAbstract: true,
})
export class FeatureCreateOrConnectWithoutFeatureOfAddressInput {
  @TypeGraphQL.Field((_type) => FeatureWhereUniqueInput, {
    nullable: false,
  })
  where!: FeatureWhereUniqueInput;

  @TypeGraphQL.Field((_type) => FeatureCreateWithoutFeatureOfAddressInput, {
    nullable: false,
  })
  create!: FeatureCreateWithoutFeatureOfAddressInput;
}
