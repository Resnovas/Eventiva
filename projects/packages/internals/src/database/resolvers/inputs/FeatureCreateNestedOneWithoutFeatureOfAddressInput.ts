import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureCreateOrConnectWithoutFeatureOfAddressInput } from '../inputs/FeatureCreateOrConnectWithoutFeatureOfAddressInput';
import { FeatureCreateWithoutFeatureOfAddressInput } from '../inputs/FeatureCreateWithoutFeatureOfAddressInput';
import { FeatureWhereUniqueInput } from '../inputs/FeatureWhereUniqueInput';

@TypeGraphQL.InputType('FeatureCreateNestedOneWithoutFeatureOfAddressInput', {
  isAbstract: true,
})
export class FeatureCreateNestedOneWithoutFeatureOfAddressInput {
  @TypeGraphQL.Field((_type) => FeatureCreateWithoutFeatureOfAddressInput, {
    nullable: true,
  })
  create?: FeatureCreateWithoutFeatureOfAddressInput | undefined;

  @TypeGraphQL.Field(
    (_type) => FeatureCreateOrConnectWithoutFeatureOfAddressInput,
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | FeatureCreateOrConnectWithoutFeatureOfAddressInput
    | undefined;

  @TypeGraphQL.Field((_type) => FeatureWhereUniqueInput, {
    nullable: true,
  })
  connect?: FeatureWhereUniqueInput | undefined;
}
