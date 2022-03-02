import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ManagersOnAccountCreateManyAccountInputEnvelope } from '../inputs/ManagersOnAccountCreateManyAccountInputEnvelope';
import { ManagersOnAccountCreateOrConnectWithoutAccountInput } from '../inputs/ManagersOnAccountCreateOrConnectWithoutAccountInput';
import { ManagersOnAccountCreateWithoutAccountInput } from '../inputs/ManagersOnAccountCreateWithoutAccountInput';
import { ManagersOnAccountScalarWhereInput } from '../inputs/ManagersOnAccountScalarWhereInput';
import { ManagersOnAccountUpdateManyWithWhereWithoutAccountInput } from '../inputs/ManagersOnAccountUpdateManyWithWhereWithoutAccountInput';
import { ManagersOnAccountUpdateWithWhereUniqueWithoutAccountInput } from '../inputs/ManagersOnAccountUpdateWithWhereUniqueWithoutAccountInput';
import { ManagersOnAccountUpsertWithWhereUniqueWithoutAccountInput } from '../inputs/ManagersOnAccountUpsertWithWhereUniqueWithoutAccountInput';
import { ManagersOnAccountWhereUniqueInput } from '../inputs/ManagersOnAccountWhereUniqueInput';

@TypeGraphQL.InputType('ManagersOnAccountUpdateManyWithoutAccountInput', {
  isAbstract: true,
})
export class ManagersOnAccountUpdateManyWithoutAccountInput {
  @TypeGraphQL.Field((_type) => [ManagersOnAccountCreateWithoutAccountInput], {
    nullable: true,
  })
  create?: ManagersOnAccountCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [ManagersOnAccountCreateOrConnectWithoutAccountInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | ManagersOnAccountCreateOrConnectWithoutAccountInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [ManagersOnAccountUpsertWithWhereUniqueWithoutAccountInput],
    {
      nullable: true,
    }
  )
  upsert?:
    | ManagersOnAccountUpsertWithWhereUniqueWithoutAccountInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => ManagersOnAccountCreateManyAccountInputEnvelope,
    {
      nullable: true,
    }
  )
  createMany?: ManagersOnAccountCreateManyAccountInputEnvelope | undefined;

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
    (_type) => [ManagersOnAccountUpdateWithWhereUniqueWithoutAccountInput],
    {
      nullable: true,
    }
  )
  update?:
    | ManagersOnAccountUpdateWithWhereUniqueWithoutAccountInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [ManagersOnAccountUpdateManyWithWhereWithoutAccountInput],
    {
      nullable: true,
    }
  )
  updateMany?:
    | ManagersOnAccountUpdateManyWithWhereWithoutAccountInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => [ManagersOnAccountScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: ManagersOnAccountScalarWhereInput[] | undefined;
}
