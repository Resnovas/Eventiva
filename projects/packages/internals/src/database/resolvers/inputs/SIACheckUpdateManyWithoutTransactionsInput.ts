import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SIACheckCreateManyTransactionsInputEnvelope } from '../inputs/SIACheckCreateManyTransactionsInputEnvelope';
import { SIACheckCreateOrConnectWithoutTransactionsInput } from '../inputs/SIACheckCreateOrConnectWithoutTransactionsInput';
import { SIACheckCreateWithoutTransactionsInput } from '../inputs/SIACheckCreateWithoutTransactionsInput';
import { SIACheckScalarWhereInput } from '../inputs/SIACheckScalarWhereInput';
import { SIACheckUpdateManyWithWhereWithoutTransactionsInput } from '../inputs/SIACheckUpdateManyWithWhereWithoutTransactionsInput';
import { SIACheckUpdateWithWhereUniqueWithoutTransactionsInput } from '../inputs/SIACheckUpdateWithWhereUniqueWithoutTransactionsInput';
import { SIACheckUpsertWithWhereUniqueWithoutTransactionsInput } from '../inputs/SIACheckUpsertWithWhereUniqueWithoutTransactionsInput';
import { SIACheckWhereUniqueInput } from '../inputs/SIACheckWhereUniqueInput';

@TypeGraphQL.InputType('SIACheckUpdateManyWithoutTransactionsInput', {
  isAbstract: true,
})
export class SIACheckUpdateManyWithoutTransactionsInput {
  @TypeGraphQL.Field((_type) => [SIACheckCreateWithoutTransactionsInput], {
    nullable: true,
  })
  create?: SIACheckCreateWithoutTransactionsInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [SIACheckCreateOrConnectWithoutTransactionsInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | SIACheckCreateOrConnectWithoutTransactionsInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [SIACheckUpsertWithWhereUniqueWithoutTransactionsInput],
    {
      nullable: true,
    }
  )
  upsert?: SIACheckUpsertWithWhereUniqueWithoutTransactionsInput[] | undefined;

  @TypeGraphQL.Field((_type) => SIACheckCreateManyTransactionsInputEnvelope, {
    nullable: true,
  })
  createMany?: SIACheckCreateManyTransactionsInputEnvelope | undefined;

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
    (_type) => [SIACheckUpdateWithWhereUniqueWithoutTransactionsInput],
    {
      nullable: true,
    }
  )
  update?: SIACheckUpdateWithWhereUniqueWithoutTransactionsInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [SIACheckUpdateManyWithWhereWithoutTransactionsInput],
    {
      nullable: true,
    }
  )
  updateMany?:
    | SIACheckUpdateManyWithWhereWithoutTransactionsInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => [SIACheckScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: SIACheckScalarWhereInput[] | undefined;
}
