import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmployersOnAccountCreateManyEmployerInputEnvelope } from '../inputs/EmployersOnAccountCreateManyEmployerInputEnvelope';
import { EmployersOnAccountCreateOrConnectWithoutEmployerInput } from '../inputs/EmployersOnAccountCreateOrConnectWithoutEmployerInput';
import { EmployersOnAccountCreateWithoutEmployerInput } from '../inputs/EmployersOnAccountCreateWithoutEmployerInput';
import { EmployersOnAccountScalarWhereInput } from '../inputs/EmployersOnAccountScalarWhereInput';
import { EmployersOnAccountUpdateManyWithWhereWithoutEmployerInput } from '../inputs/EmployersOnAccountUpdateManyWithWhereWithoutEmployerInput';
import { EmployersOnAccountUpdateWithWhereUniqueWithoutEmployerInput } from '../inputs/EmployersOnAccountUpdateWithWhereUniqueWithoutEmployerInput';
import { EmployersOnAccountUpsertWithWhereUniqueWithoutEmployerInput } from '../inputs/EmployersOnAccountUpsertWithWhereUniqueWithoutEmployerInput';
import { EmployersOnAccountWhereUniqueInput } from '../inputs/EmployersOnAccountWhereUniqueInput';

@TypeGraphQL.InputType('EmployersOnAccountUpdateManyWithoutEmployerInput', {
  isAbstract: true,
})
export class EmployersOnAccountUpdateManyWithoutEmployerInput {
  @TypeGraphQL.Field(
    (_type) => [EmployersOnAccountCreateWithoutEmployerInput],
    {
      nullable: true,
    }
  )
  create?: EmployersOnAccountCreateWithoutEmployerInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [EmployersOnAccountCreateOrConnectWithoutEmployerInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | EmployersOnAccountCreateOrConnectWithoutEmployerInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [EmployersOnAccountUpsertWithWhereUniqueWithoutEmployerInput],
    {
      nullable: true,
    }
  )
  upsert?:
    | EmployersOnAccountUpsertWithWhereUniqueWithoutEmployerInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => EmployersOnAccountCreateManyEmployerInputEnvelope,
    {
      nullable: true,
    }
  )
  createMany?: EmployersOnAccountCreateManyEmployerInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [EmployersOnAccountWhereUniqueInput], {
    nullable: true,
  })
  connect?: EmployersOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [EmployersOnAccountWhereUniqueInput], {
    nullable: true,
  })
  set?: EmployersOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [EmployersOnAccountWhereUniqueInput], {
    nullable: true,
  })
  disconnect?: EmployersOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [EmployersOnAccountWhereUniqueInput], {
    nullable: true,
  })
  delete?: EmployersOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [EmployersOnAccountUpdateWithWhereUniqueWithoutEmployerInput],
    {
      nullable: true,
    }
  )
  update?:
    | EmployersOnAccountUpdateWithWhereUniqueWithoutEmployerInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [EmployersOnAccountUpdateManyWithWhereWithoutEmployerInput],
    {
      nullable: true,
    }
  )
  updateMany?:
    | EmployersOnAccountUpdateManyWithWhereWithoutEmployerInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => [EmployersOnAccountScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: EmployersOnAccountScalarWhereInput[] | undefined;
}
