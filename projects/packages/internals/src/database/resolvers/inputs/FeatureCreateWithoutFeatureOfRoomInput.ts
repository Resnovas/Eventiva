import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureOfAddressCreateNestedManyWithoutFeatureInput } from '../inputs/FeatureOfAddressCreateNestedManyWithoutFeatureInput';
import { FeatureType } from '../../enums/FeatureType';

@TypeGraphQL.InputType('FeatureCreateWithoutFeatureOfRoomInput', {
  isAbstract: true,
})
export class FeatureCreateWithoutFeatureOfRoomInput {
  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  id?: string | undefined;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  name!: string;

  @TypeGraphQL.Field((_type) => FeatureType, {
    nullable: false,
  })
  type!: 'STRING' | 'BOOLEAN' | 'NUMBER';

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
    (_type) => FeatureOfAddressCreateNestedManyWithoutFeatureInput,
    {
      nullable: true,
    }
  )
  featureOfAddress?:
    | FeatureOfAddressCreateNestedManyWithoutFeatureInput
    | undefined;
}
