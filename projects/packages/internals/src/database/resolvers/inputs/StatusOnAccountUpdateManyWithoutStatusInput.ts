import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { StatusOnAccountCreateManyStatusInputEnvelope } from '../inputs/StatusOnAccountCreateManyStatusInputEnvelope';
import { StatusOnAccountCreateOrConnectWithoutStatusInput } from '../inputs/StatusOnAccountCreateOrConnectWithoutStatusInput';
import { StatusOnAccountCreateWithoutStatusInput } from '../inputs/StatusOnAccountCreateWithoutStatusInput';
import { StatusOnAccountScalarWhereInput } from '../inputs/StatusOnAccountScalarWhereInput';
import { StatusOnAccountUpdateManyWithWhereWithoutStatusInput } from '../inputs/StatusOnAccountUpdateManyWithWhereWithoutStatusInput';
import { StatusOnAccountUpdateWithWhereUniqueWithoutStatusInput } from '../inputs/StatusOnAccountUpdateWithWhereUniqueWithoutStatusInput';
import { StatusOnAccountUpsertWithWhereUniqueWithoutStatusInput } from '../inputs/StatusOnAccountUpsertWithWhereUniqueWithoutStatusInput';
import { StatusOnAccountWhereUniqueInput } from '../inputs/StatusOnAccountWhereUniqueInput';

@TypeGraphQL.InputType('StatusOnAccountUpdateManyWithoutStatusInput', {
  isAbstract: true,
})
export class StatusOnAccountUpdateManyWithoutStatusInput {
  @TypeGraphQL.Field((_type) => [StatusOnAccountCreateWithoutStatusInput], {
    nullable: true,
  })
  create?: StatusOnAccountCreateWithoutStatusInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [StatusOnAccountCreateOrConnectWithoutStatusInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | StatusOnAccountCreateOrConnectWithoutStatusInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [StatusOnAccountUpsertWithWhereUniqueWithoutStatusInput],
    {
      nullable: true,
    }
  )
  upsert?: StatusOnAccountUpsertWithWhereUniqueWithoutStatusInput[] | undefined;

  @TypeGraphQL.Field((_type) => StatusOnAccountCreateManyStatusInputEnvelope, {
    nullable: true,
  })
  createMany?: StatusOnAccountCreateManyStatusInputEnvelope | undefined;

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
    (_type) => [StatusOnAccountUpdateWithWhereUniqueWithoutStatusInput],
    {
      nullable: true,
    }
  )
  update?: StatusOnAccountUpdateWithWhereUniqueWithoutStatusInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [StatusOnAccountUpdateManyWithWhereWithoutStatusInput],
    {
      nullable: true,
    }
  )
  updateMany?:
    | StatusOnAccountUpdateManyWithWhereWithoutStatusInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => [StatusOnAccountScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: StatusOnAccountScalarWhereInput[] | undefined;
}
