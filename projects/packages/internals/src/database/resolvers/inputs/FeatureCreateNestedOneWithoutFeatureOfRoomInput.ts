import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureCreateOrConnectWithoutFeatureOfRoomInput } from '../inputs/FeatureCreateOrConnectWithoutFeatureOfRoomInput';
import { FeatureCreateWithoutFeatureOfRoomInput } from '../inputs/FeatureCreateWithoutFeatureOfRoomInput';
import { FeatureWhereUniqueInput } from '../inputs/FeatureWhereUniqueInput';

@TypeGraphQL.InputType('FeatureCreateNestedOneWithoutFeatureOfRoomInput', {
  isAbstract: true,
})
export class FeatureCreateNestedOneWithoutFeatureOfRoomInput {
  @TypeGraphQL.Field((_type) => FeatureCreateWithoutFeatureOfRoomInput, {
    nullable: true,
  })
  create?: FeatureCreateWithoutFeatureOfRoomInput | undefined;

  @TypeGraphQL.Field(
    (_type) => FeatureCreateOrConnectWithoutFeatureOfRoomInput,
    {
      nullable: true,
    }
  )
  connectOrCreate?: FeatureCreateOrConnectWithoutFeatureOfRoomInput | undefined;

  @TypeGraphQL.Field((_type) => FeatureWhereUniqueInput, {
    nullable: true,
  })
  connect?: FeatureWhereUniqueInput | undefined;
}
