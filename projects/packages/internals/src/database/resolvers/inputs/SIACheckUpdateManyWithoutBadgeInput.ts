import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SIACheckCreateManyBadgeInputEnvelope } from '../inputs/SIACheckCreateManyBadgeInputEnvelope';
import { SIACheckCreateOrConnectWithoutBadgeInput } from '../inputs/SIACheckCreateOrConnectWithoutBadgeInput';
import { SIACheckCreateWithoutBadgeInput } from '../inputs/SIACheckCreateWithoutBadgeInput';
import { SIACheckScalarWhereInput } from '../inputs/SIACheckScalarWhereInput';
import { SIACheckUpdateManyWithWhereWithoutBadgeInput } from '../inputs/SIACheckUpdateManyWithWhereWithoutBadgeInput';
import { SIACheckUpdateWithWhereUniqueWithoutBadgeInput } from '../inputs/SIACheckUpdateWithWhereUniqueWithoutBadgeInput';
import { SIACheckUpsertWithWhereUniqueWithoutBadgeInput } from '../inputs/SIACheckUpsertWithWhereUniqueWithoutBadgeInput';
import { SIACheckWhereUniqueInput } from '../inputs/SIACheckWhereUniqueInput';

@TypeGraphQL.InputType('SIACheckUpdateManyWithoutBadgeInput', {
  isAbstract: true,
})
export class SIACheckUpdateManyWithoutBadgeInput {
  @TypeGraphQL.Field((_type) => [SIACheckCreateWithoutBadgeInput], {
    nullable: true,
  })
  create?: SIACheckCreateWithoutBadgeInput[] | undefined;

  @TypeGraphQL.Field((_type) => [SIACheckCreateOrConnectWithoutBadgeInput], {
    nullable: true,
  })
  connectOrCreate?: SIACheckCreateOrConnectWithoutBadgeInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [SIACheckUpsertWithWhereUniqueWithoutBadgeInput],
    {
      nullable: true,
    }
  )
  upsert?: SIACheckUpsertWithWhereUniqueWithoutBadgeInput[] | undefined;

  @TypeGraphQL.Field((_type) => SIACheckCreateManyBadgeInputEnvelope, {
    nullable: true,
  })
  createMany?: SIACheckCreateManyBadgeInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [SIACheckWhereUniqueInput], {
    nullable: true,
  })
  connect?: SIACheckWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [SIACheckWhereUniqueInput], {
    nullable: true,
  })
  set?: SIACheckWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [SIACheckWhereUniqueInput], {
    nullable: true,
  })
  disconnect?: SIACheckWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [SIACheckWhereUniqueInput], {
    nullable: true,
  })
  delete?: SIACheckWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [SIACheckUpdateWithWhereUniqueWithoutBadgeInput],
    {
      nullable: true,
    }
  )
  update?: SIACheckUpdateWithWhereUniqueWithoutBadgeInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [SIACheckUpdateManyWithWhereWithoutBadgeInput],
    {
      nullable: true,
    }
  )
  updateMany?: SIACheckUpdateManyWithWhereWithoutBadgeInput[] | undefined;

  @TypeGraphQL.Field((_type) => [SIACheckScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: SIACheckScalarWhereInput[] | undefined;
}
