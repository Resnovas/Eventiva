import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureOfRoomCreateManyFeatureInputEnvelope } from '../inputs/FeatureOfRoomCreateManyFeatureInputEnvelope';
import { FeatureOfRoomCreateOrConnectWithoutFeatureInput } from '../inputs/FeatureOfRoomCreateOrConnectWithoutFeatureInput';
import { FeatureOfRoomCreateWithoutFeatureInput } from '../inputs/FeatureOfRoomCreateWithoutFeatureInput';
import { FeatureOfRoomScalarWhereInput } from '../inputs/FeatureOfRoomScalarWhereInput';
import { FeatureOfRoomUpdateManyWithWhereWithoutFeatureInput } from '../inputs/FeatureOfRoomUpdateManyWithWhereWithoutFeatureInput';
import { FeatureOfRoomUpdateWithWhereUniqueWithoutFeatureInput } from '../inputs/FeatureOfRoomUpdateWithWhereUniqueWithoutFeatureInput';
import { FeatureOfRoomUpsertWithWhereUniqueWithoutFeatureInput } from '../inputs/FeatureOfRoomUpsertWithWhereUniqueWithoutFeatureInput';
import { FeatureOfRoomWhereUniqueInput } from '../inputs/FeatureOfRoomWhereUniqueInput';

@TypeGraphQL.InputType('FeatureOfRoomUpdateManyWithoutFeatureInput', {
  isAbstract: true,
})
export class FeatureOfRoomUpdateManyWithoutFeatureInput {
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

  @TypeGraphQL.Field(
    (_type) => [FeatureOfRoomUpsertWithWhereUniqueWithoutFeatureInput],
    {
      nullable: true,
    }
  )
  upsert?: FeatureOfRoomUpsertWithWhereUniqueWithoutFeatureInput[] | undefined;

  @TypeGraphQL.Field((_type) => FeatureOfRoomCreateManyFeatureInputEnvelope, {
    nullable: true,
  })
  createMany?: FeatureOfRoomCreateManyFeatureInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [FeatureOfRoomWhereUniqueInput], {
    nullable: true,
  })
  connect?: FeatureOfRoomWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FeatureOfRoomWhereUniqueInput], {
    nullable: true,
  })
  set?: FeatureOfRoomWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FeatureOfRoomWhereUniqueInput], {
    nullable: true,
  })
  disconnect?: FeatureOfRoomWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FeatureOfRoomWhereUniqueInput], {
    nullable: true,
  })
  delete?: FeatureOfRoomWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [FeatureOfRoomUpdateWithWhereUniqueWithoutFeatureInput],
    {
      nullable: true,
    }
  )
  update?: FeatureOfRoomUpdateWithWhereUniqueWithoutFeatureInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [FeatureOfRoomUpdateManyWithWhereWithoutFeatureInput],
    {
      nullable: true,
    }
  )
  updateMany?:
    | FeatureOfRoomUpdateManyWithWhereWithoutFeatureInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => [FeatureOfRoomScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: FeatureOfRoomScalarWhereInput[] | undefined;
}
