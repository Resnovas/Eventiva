import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ApplicationCreateManyAccountInputEnvelope } from '../inputs/ApplicationCreateManyAccountInputEnvelope';
import { ApplicationCreateOrConnectWithoutAccountInput } from '../inputs/ApplicationCreateOrConnectWithoutAccountInput';
import { ApplicationCreateWithoutAccountInput } from '../inputs/ApplicationCreateWithoutAccountInput';
import { ApplicationScalarWhereInput } from '../inputs/ApplicationScalarWhereInput';
import { ApplicationUpdateManyWithWhereWithoutAccountInput } from '../inputs/ApplicationUpdateManyWithWhereWithoutAccountInput';
import { ApplicationUpdateWithWhereUniqueWithoutAccountInput } from '../inputs/ApplicationUpdateWithWhereUniqueWithoutAccountInput';
import { ApplicationUpsertWithWhereUniqueWithoutAccountInput } from '../inputs/ApplicationUpsertWithWhereUniqueWithoutAccountInput';
import { ApplicationWhereUniqueInput } from '../inputs/ApplicationWhereUniqueInput';

@TypeGraphQL.InputType('ApplicationUpdateManyWithoutAccountInput', {
  isAbstract: true,
})
export class ApplicationUpdateManyWithoutAccountInput {
  @TypeGraphQL.Field((_type) => [ApplicationCreateWithoutAccountInput], {
    nullable: true,
  })
  create?: ApplicationCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [ApplicationCreateOrConnectWithoutAccountInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?: ApplicationCreateOrConnectWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [ApplicationUpsertWithWhereUniqueWithoutAccountInput],
    {
      nullable: true,
    }
  )
  upsert?: ApplicationUpsertWithWhereUniqueWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field((_type) => ApplicationCreateManyAccountInputEnvelope, {
    nullable: true,
  })
  createMany?: ApplicationCreateManyAccountInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [ApplicationWhereUniqueInput], {
    nullable: true,
  })
  connect?: ApplicationWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [ApplicationWhereUniqueInput], {
    nullable: true,
  })
  set?: ApplicationWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [ApplicationWhereUniqueInput], {
    nullable: true,
  })
  disconnect?: ApplicationWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [ApplicationWhereUniqueInput], {
    nullable: true,
  })
  delete?: ApplicationWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [ApplicationUpdateWithWhereUniqueWithoutAccountInput],
    {
      nullable: true,
    }
  )
  update?: ApplicationUpdateWithWhereUniqueWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [ApplicationUpdateManyWithWhereWithoutAccountInput],
    {
      nullable: true,
    }
  )
  updateMany?: ApplicationUpdateManyWithWhereWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field((_type) => [ApplicationScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: ApplicationScalarWhereInput[] | undefined;
}
