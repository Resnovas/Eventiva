import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmployersOnAccountCreateManyAccountInputEnvelope } from '../inputs/EmployersOnAccountCreateManyAccountInputEnvelope';
import { EmployersOnAccountCreateOrConnectWithoutAccountInput } from '../inputs/EmployersOnAccountCreateOrConnectWithoutAccountInput';
import { EmployersOnAccountCreateWithoutAccountInput } from '../inputs/EmployersOnAccountCreateWithoutAccountInput';
import { EmployersOnAccountScalarWhereInput } from '../inputs/EmployersOnAccountScalarWhereInput';
import { EmployersOnAccountUpdateManyWithWhereWithoutAccountInput } from '../inputs/EmployersOnAccountUpdateManyWithWhereWithoutAccountInput';
import { EmployersOnAccountUpdateWithWhereUniqueWithoutAccountInput } from '../inputs/EmployersOnAccountUpdateWithWhereUniqueWithoutAccountInput';
import { EmployersOnAccountUpsertWithWhereUniqueWithoutAccountInput } from '../inputs/EmployersOnAccountUpsertWithWhereUniqueWithoutAccountInput';
import { EmployersOnAccountWhereUniqueInput } from '../inputs/EmployersOnAccountWhereUniqueInput';

@TypeGraphQL.InputType('EmployersOnAccountUpdateManyWithoutAccountInput', {
  isAbstract: true,
})
export class EmployersOnAccountUpdateManyWithoutAccountInput {
  @TypeGraphQL.Field((_type) => [EmployersOnAccountCreateWithoutAccountInput], {
    nullable: true,
  })
  create?: EmployersOnAccountCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [EmployersOnAccountCreateOrConnectWithoutAccountInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | EmployersOnAccountCreateOrConnectWithoutAccountInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [EmployersOnAccountUpsertWithWhereUniqueWithoutAccountInput],
    {
      nullable: true,
    }
  )
  upsert?:
    | EmployersOnAccountUpsertWithWhereUniqueWithoutAccountInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => EmployersOnAccountCreateManyAccountInputEnvelope,
    {
      nullable: true,
    }
  )
  createMany?: EmployersOnAccountCreateManyAccountInputEnvelope | undefined;

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
    (_type) => [EmployersOnAccountUpdateWithWhereUniqueWithoutAccountInput],
    {
      nullable: true,
    }
  )
  update?:
    | EmployersOnAccountUpdateWithWhereUniqueWithoutAccountInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [EmployersOnAccountUpdateManyWithWhereWithoutAccountInput],
    {
      nullable: true,
    }
  )
  updateMany?:
    | EmployersOnAccountUpdateManyWithWhereWithoutAccountInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => [EmployersOnAccountScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: EmployersOnAccountScalarWhereInput[] | undefined;
}
