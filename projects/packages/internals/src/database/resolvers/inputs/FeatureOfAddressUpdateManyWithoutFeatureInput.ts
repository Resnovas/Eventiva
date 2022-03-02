import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureOfAddressCreateManyFeatureInputEnvelope } from '../inputs/FeatureOfAddressCreateManyFeatureInputEnvelope';
import { FeatureOfAddressCreateOrConnectWithoutFeatureInput } from '../inputs/FeatureOfAddressCreateOrConnectWithoutFeatureInput';
import { FeatureOfAddressCreateWithoutFeatureInput } from '../inputs/FeatureOfAddressCreateWithoutFeatureInput';
import { FeatureOfAddressScalarWhereInput } from '../inputs/FeatureOfAddressScalarWhereInput';
import { FeatureOfAddressUpdateManyWithWhereWithoutFeatureInput } from '../inputs/FeatureOfAddressUpdateManyWithWhereWithoutFeatureInput';
import { FeatureOfAddressUpdateWithWhereUniqueWithoutFeatureInput } from '../inputs/FeatureOfAddressUpdateWithWhereUniqueWithoutFeatureInput';
import { FeatureOfAddressUpsertWithWhereUniqueWithoutFeatureInput } from '../inputs/FeatureOfAddressUpsertWithWhereUniqueWithoutFeatureInput';
import { FeatureOfAddressWhereUniqueInput } from '../inputs/FeatureOfAddressWhereUniqueInput';

@TypeGraphQL.InputType('FeatureOfAddressUpdateManyWithoutFeatureInput', {
  isAbstract: true,
})
export class FeatureOfAddressUpdateManyWithoutFeatureInput {
  @TypeGraphQL.Field((_type) => [FeatureOfAddressCreateWithoutFeatureInput], {
    nullable: true,
  })
  create?: FeatureOfAddressCreateWithoutFeatureInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [FeatureOfAddressCreateOrConnectWithoutFeatureInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | FeatureOfAddressCreateOrConnectWithoutFeatureInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [FeatureOfAddressUpsertWithWhereUniqueWithoutFeatureInput],
    {
      nullable: true,
    }
  )
  upsert?:
    | FeatureOfAddressUpsertWithWhereUniqueWithoutFeatureInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => FeatureOfAddressCreateManyFeatureInputEnvelope,
    {
      nullable: true,
    }
  )
  createMany?: FeatureOfAddressCreateManyFeatureInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [FeatureOfAddressWhereUniqueInput], {
    nullable: true,
  })
  connect?: FeatureOfAddressWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FeatureOfAddressWhereUniqueInput], {
    nullable: true,
  })
  set?: FeatureOfAddressWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FeatureOfAddressWhereUniqueInput], {
    nullable: true,
  })
  disconnect?: FeatureOfAddressWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [FeatureOfAddressWhereUniqueInput], {
    nullable: true,
  })
  delete?: FeatureOfAddressWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [FeatureOfAddressUpdateWithWhereUniqueWithoutFeatureInput],
    {
      nullable: true,
    }
  )
  update?:
    | FeatureOfAddressUpdateWithWhereUniqueWithoutFeatureInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [FeatureOfAddressUpdateManyWithWhereWithoutFeatureInput],
    {
      nullable: true,
    }
  )
  updateMany?:
    | FeatureOfAddressUpdateManyWithWhereWithoutFeatureInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => [FeatureOfAddressScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: FeatureOfAddressScalarWhereInput[] | undefined;
}
