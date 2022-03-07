import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureOfRoomCreateManyRoomInputEnvelope } from '../inputs/FeatureOfRoomCreateManyRoomInputEnvelope';
import { FeatureOfRoomCreateOrConnectWithoutRoomInput } from '../inputs/FeatureOfRoomCreateOrConnectWithoutRoomInput';
import { FeatureOfRoomCreateWithoutRoomInput } from '../inputs/FeatureOfRoomCreateWithoutRoomInput';
import { FeatureOfRoomScalarWhereInput } from '../inputs/FeatureOfRoomScalarWhereInput';
import { FeatureOfRoomUpdateManyWithWhereWithoutRoomInput } from '../inputs/FeatureOfRoomUpdateManyWithWhereWithoutRoomInput';
import { FeatureOfRoomUpdateWithWhereUniqueWithoutRoomInput } from '../inputs/FeatureOfRoomUpdateWithWhereUniqueWithoutRoomInput';
import { FeatureOfRoomUpsertWithWhereUniqueWithoutRoomInput } from '../inputs/FeatureOfRoomUpsertWithWhereUniqueWithoutRoomInput';
import { FeatureOfRoomWhereUniqueInput } from '../inputs/FeatureOfRoomWhereUniqueInput';

@TypeGraphQL.InputType('FeatureOfRoomUpdateManyWithoutRoomInput', {
  isAbstract: true,
})
export class FeatureOfRoomUpdateManyWithoutRoomInput {
  @TypeGraphQL.Field((_type) => [FeatureOfRoomCreateWithoutRoomInput], {
    nullable: true,
  })
  create?: FeatureOfRoomCreateWithoutRoomInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [FeatureOfRoomCreateOrConnectWithoutRoomInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?: FeatureOfRoomCreateOrConnectWithoutRoomInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [FeatureOfRoomUpsertWithWhereUniqueWithoutRoomInput],
    {
      nullable: true,
    }
  )
  upsert?: FeatureOfRoomUpsertWithWhereUniqueWithoutRoomInput[] | undefined;

  @TypeGraphQL.Field((_type) => FeatureOfRoomCreateManyRoomInputEnvelope, {
    nullable: true,
  })
  createMany?: FeatureOfRoomCreateManyRoomInputEnvelope | undefined;

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
    (_type) => [FeatureOfRoomUpdateWithWhereUniqueWithoutRoomInput],
    {
      nullable: true,
    }
  )
  update?: FeatureOfRoomUpdateWithWhereUniqueWithoutRoomInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [FeatureOfRoomUpdateManyWithWhereWithoutRoomInput],
    {
      nullable: true,
    }
  )
  updateMany?: FeatureOfRoomUpdateManyWithWhereWithoutRoomInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FeatureOfRoomScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: FeatureOfRoomScalarWhereInput[] | undefined;
}
