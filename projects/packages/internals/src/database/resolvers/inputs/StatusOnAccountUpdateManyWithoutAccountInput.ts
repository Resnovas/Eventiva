import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { StatusOnAccountCreateManyAccountInputEnvelope } from '../inputs/StatusOnAccountCreateManyAccountInputEnvelope';
import { StatusOnAccountCreateOrConnectWithoutAccountInput } from '../inputs/StatusOnAccountCreateOrConnectWithoutAccountInput';
import { StatusOnAccountCreateWithoutAccountInput } from '../inputs/StatusOnAccountCreateWithoutAccountInput';
import { StatusOnAccountScalarWhereInput } from '../inputs/StatusOnAccountScalarWhereInput';
import { StatusOnAccountUpdateManyWithWhereWithoutAccountInput } from '../inputs/StatusOnAccountUpdateManyWithWhereWithoutAccountInput';
import { StatusOnAccountUpdateWithWhereUniqueWithoutAccountInput } from '../inputs/StatusOnAccountUpdateWithWhereUniqueWithoutAccountInput';
import { StatusOnAccountUpsertWithWhereUniqueWithoutAccountInput } from '../inputs/StatusOnAccountUpsertWithWhereUniqueWithoutAccountInput';
import { StatusOnAccountWhereUniqueInput } from '../inputs/StatusOnAccountWhereUniqueInput';

@TypeGraphQL.InputType('StatusOnAccountUpdateManyWithoutAccountInput', {
  isAbstract: true,
})
export class StatusOnAccountUpdateManyWithoutAccountInput {
  @TypeGraphQL.Field((_type) => [StatusOnAccountCreateWithoutAccountInput], {
    nullable: true,
  })
  create?: StatusOnAccountCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [StatusOnAccountCreateOrConnectWithoutAccountInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | StatusOnAccountCreateOrConnectWithoutAccountInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [StatusOnAccountUpsertWithWhereUniqueWithoutAccountInput],
    {
      nullable: true,
    }
  )
  upsert?:
    | StatusOnAccountUpsertWithWhereUniqueWithoutAccountInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => StatusOnAccountCreateManyAccountInputEnvelope, {
    nullable: true,
  })
  createMany?: StatusOnAccountCreateManyAccountInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [StatusOnAccountWhereUniqueInput], {
    nullable: true,
  })
  connect?: StatusOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [StatusOnAccountWhereUniqueInput], {
    nullable: true,
  })
  set?: StatusOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [StatusOnAccountWhereUniqueInput], {
    nullable: true,
  })
  disconnect?: StatusOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [StatusOnAccountWhereUniqueInput], {
    nullable: true,
  })
  delete?: StatusOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [StatusOnAccountUpdateWithWhereUniqueWithoutAccountInput],
    {
      nullable: true,
    }
  )
  update?:
    | StatusOnAccountUpdateWithWhereUniqueWithoutAccountInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [StatusOnAccountUpdateManyWithWhereWithoutAccountInput],
    {
      nullable: true,
    }
  )
  updateMany?:
    | StatusOnAccountUpdateManyWithWhereWithoutAccountInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => [StatusOnAccountScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: StatusOnAccountScalarWhereInput[] | undefined;
}
