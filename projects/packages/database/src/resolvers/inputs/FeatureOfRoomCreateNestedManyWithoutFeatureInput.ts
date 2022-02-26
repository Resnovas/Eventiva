import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureOfRoomCreateManyFeatureInputEnvelope } from '../inputs/FeatureOfRoomCreateManyFeatureInputEnvelope';
import { FeatureOfRoomCreateOrConnectWithoutFeatureInput } from '../inputs/FeatureOfRoomCreateOrConnectWithoutFeatureInput';
import { FeatureOfRoomCreateWithoutFeatureInput } from '../inputs/FeatureOfRoomCreateWithoutFeatureInput';
import { FeatureOfRoomWhereUniqueInput } from '../inputs/FeatureOfRoomWhereUniqueInput';

@TypeGraphQL.InputType('FeatureOfRoomCreateNestedManyWithoutFeatureInput', {
  isAbstract: true,
})
export class FeatureOfRoomCreateNestedManyWithoutFeatureInput {
  @TypeGraphQL.Field((_type) => [FeatureOfRoomCreateWithoutFeatureInput], {
    nullable: true,
  })
  create?: FeatureOfRoomCreateWithoutFeatureInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [FeatureOfRoomCreateOrConnectWithoutFeatureInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | FeatureOfRoomCreateOrConnectWithoutFeatureInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => FeatureOfRoomCreateManyFeatureInputEnvelope, {
    nullable: true,
  })
  createMany?: FeatureOfRoomCreateManyFeatureInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [FeatureOfRoomWhereUniqueInput], {
    nullable: true,
  })
  connect?: FeatureOfRoomWhereUniqueInput[] | undefined;
}
