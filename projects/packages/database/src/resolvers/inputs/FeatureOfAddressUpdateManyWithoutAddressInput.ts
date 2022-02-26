import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { FeatureOfAddressCreateManyAddressInputEnvelope } from '../inputs/FeatureOfAddressCreateManyAddressInputEnvelope';
import { FeatureOfAddressCreateOrConnectWithoutAddressInput } from '../inputs/FeatureOfAddressCreateOrConnectWithoutAddressInput';
import { FeatureOfAddressCreateWithoutAddressInput } from '../inputs/FeatureOfAddressCreateWithoutAddressInput';
import { FeatureOfAddressScalarWhereInput } from '../inputs/FeatureOfAddressScalarWhereInput';
import { FeatureOfAddressUpdateManyWithWhereWithoutAddressInput } from '../inputs/FeatureOfAddressUpdateManyWithWhereWithoutAddressInput';
import { FeatureOfAddressUpdateWithWhereUniqueWithoutAddressInput } from '../inputs/FeatureOfAddressUpdateWithWhereUniqueWithoutAddressInput';
import { FeatureOfAddressUpsertWithWhereUniqueWithoutAddressInput } from '../inputs/FeatureOfAddressUpsertWithWhereUniqueWithoutAddressInput';
import { FeatureOfAddressWhereUniqueInput } from '../inputs/FeatureOfAddressWhereUniqueInput';

@TypeGraphQL.InputType('FeatureOfAddressUpdateManyWithoutAddressInput', {
  isAbstract: true,
})
export class FeatureOfAddressUpdateManyWithoutAddressInput {
  @TypeGraphQL.Field((_type) => [FeatureOfAddressCreateWithoutAddressInput], {
    nullable: true,
  })
  create?: FeatureOfAddressCreateWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [FeatureOfAddressCreateOrConnectWithoutAddressInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | FeatureOfAddressCreateOrConnectWithoutAddressInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [FeatureOfAddressUpsertWithWhereUniqueWithoutAddressInput],
    {
      nullable: true,
    }
  )
  upsert?:
    | FeatureOfAddressUpsertWithWhereUniqueWithoutAddressInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => FeatureOfAddressCreateManyAddressInputEnvelope,
    {
      nullable: true,
    }
  )
  createMany?: FeatureOfAddressCreateManyAddressInputEnvelope | undefined;

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
    (_type) => [FeatureOfAddressUpdateWithWhereUniqueWithoutAddressInput],
    {
      nullable: true,
    }
  )
  update?:
    | FeatureOfAddressUpdateWithWhereUniqueWithoutAddressInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [FeatureOfAddressUpdateManyWithWhereWithoutAddressInput],
    {
      nullable: true,
    }
  )
  updateMany?:
    | FeatureOfAddressUpdateManyWithWhereWithoutAddressInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => [FeatureOfAddressScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: FeatureOfAddressScalarWhereInput[] | undefined;
}
