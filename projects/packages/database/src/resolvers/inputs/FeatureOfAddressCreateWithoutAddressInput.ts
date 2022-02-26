import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureCreateNestedOneWithoutFeatureOfAddressInput } from '../inputs/FeatureCreateNestedOneWithoutFeatureOfAddressInput';

@TypeGraphQL.InputType('FeatureOfAddressCreateWithoutAddressInput', {
  isAbstract: true,
})
export class FeatureOfAddressCreateWithoutAddressInput {
  @TypeGraphQL.Field((_type) => GraphQLScalars.JSONResolver, {
    nullable: true,
  })
  data?: Prisma.InputJsonValue | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  updatedAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  deleted?: Date | undefined;

  @TypeGraphQL.Field(
    (_type) => FeatureCreateNestedOneWithoutFeatureOfAddressInput,
    {
      nullable: false,
    }
  )
  feature!: FeatureCreateNestedOneWithoutFeatureOfAddressInput;
}