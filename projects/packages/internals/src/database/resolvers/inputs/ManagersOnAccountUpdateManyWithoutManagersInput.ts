import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ManagersOnAccountCreateManyManagersInputEnvelope } from '../inputs/ManagersOnAccountCreateManyManagersInputEnvelope';
import { ManagersOnAccountCreateOrConnectWithoutManagersInput } from '../inputs/ManagersOnAccountCreateOrConnectWithoutManagersInput';
import { ManagersOnAccountCreateWithoutManagersInput } from '../inputs/ManagersOnAccountCreateWithoutManagersInput';
import { ManagersOnAccountScalarWhereInput } from '../inputs/ManagersOnAccountScalarWhereInput';
import { ManagersOnAccountUpdateManyWithWhereWithoutManagersInput } from '../inputs/ManagersOnAccountUpdateManyWithWhereWithoutManagersInput';
import { ManagersOnAccountUpdateWithWhereUniqueWithoutManagersInput } from '../inputs/ManagersOnAccountUpdateWithWhereUniqueWithoutManagersInput';
import { ManagersOnAccountUpsertWithWhereUniqueWithoutManagersInput } from '../inputs/ManagersOnAccountUpsertWithWhereUniqueWithoutManagersInput';
import { ManagersOnAccountWhereUniqueInput } from '../inputs/ManagersOnAccountWhereUniqueInput';

@TypeGraphQL.InputType('ManagersOnAccountUpdateManyWithoutManagersInput', {
  isAbstract: true,
})
export class ManagersOnAccountUpdateManyWithoutManagersInput {
  @TypeGraphQL.Field((_type) => [ManagersOnAccountCreateWithoutManagersInput], {
    nullable: true,
  })
  create?: ManagersOnAccountCreateWithoutManagersInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [ManagersOnAccountCreateOrConnectWithoutManagersInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | ManagersOnAccountCreateOrConnectWithoutManagersInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [ManagersOnAccountUpsertWithWhereUniqueWithoutManagersInput],
    {
      nullable: true,
    }
  )
  upsert?:
    | ManagersOnAccountUpsertWithWhereUniqueWithoutManagersInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => ManagersOnAccountCreateManyManagersInputEnvelope,
    {
      nullable: true,
    }
  )
  createMany?: ManagersOnAccountCreateManyManagersInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [ManagersOnAccountWhereUniqueInput], {
    nullable: true,
  })
  connect?: ManagersOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [ManagersOnAccountWhereUniqueInput], {
    nullable: true,
  })
  set?: ManagersOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [ManagersOnAccountWhereUniqueInput], {
    nullable: true,
  })
  disconnect?: ManagersOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [ManagersOnAccountWhereUniqueInput], {
    nullable: true,
  })
  delete?: ManagersOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [ManagersOnAccountUpdateWithWhereUniqueWithoutManagersInput],
    {
      nullable: true,
    }
  )
  update?:
    | ManagersOnAccountUpdateWithWhereUniqueWithoutManagersInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [ManagersOnAccountUpdateManyWithWhereWithoutManagersInput],
    {
      nullable: true,
    }
  )
  updateMany?:
    | ManagersOnAccountUpdateManyWithWhereWithoutManagersInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => [ManagersOnAccountScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: ManagersOnAccountScalarWhereInput[] | undefined;
}
