import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SubscriptionOnAccountCreateManySubscriptionInputEnvelope } from '../inputs/SubscriptionOnAccountCreateManySubscriptionInputEnvelope';
import { SubscriptionOnAccountCreateOrConnectWithoutSubscriptionInput } from '../inputs/SubscriptionOnAccountCreateOrConnectWithoutSubscriptionInput';
import { SubscriptionOnAccountCreateWithoutSubscriptionInput } from '../inputs/SubscriptionOnAccountCreateWithoutSubscriptionInput';
import { SubscriptionOnAccountScalarWhereInput } from '../inputs/SubscriptionOnAccountScalarWhereInput';
import { SubscriptionOnAccountUpdateManyWithWhereWithoutSubscriptionInput } from '../inputs/SubscriptionOnAccountUpdateManyWithWhereWithoutSubscriptionInput';
import { SubscriptionOnAccountUpdateWithWhereUniqueWithoutSubscriptionInput } from '../inputs/SubscriptionOnAccountUpdateWithWhereUniqueWithoutSubscriptionInput';
import { SubscriptionOnAccountUpsertWithWhereUniqueWithoutSubscriptionInput } from '../inputs/SubscriptionOnAccountUpsertWithWhereUniqueWithoutSubscriptionInput';
import { SubscriptionOnAccountWhereUniqueInput } from '../inputs/SubscriptionOnAccountWhereUniqueInput';

@TypeGraphQL.InputType(
  'SubscriptionOnAccountUpdateManyWithoutSubscriptionInput',
  {
    isAbstract: true,
  }
)
export class SubscriptionOnAccountUpdateManyWithoutSubscriptionInput {
  @TypeGraphQL.Field(
    (_type) => [SubscriptionOnAccountCreateWithoutSubscriptionInput],
    {
      nullable: true,
    }
  )
  create?: SubscriptionOnAccountCreateWithoutSubscriptionInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [SubscriptionOnAccountCreateOrConnectWithoutSubscriptionInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | SubscriptionOnAccountCreateOrConnectWithoutSubscriptionInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [
      SubscriptionOnAccountUpsertWithWhereUniqueWithoutSubscriptionInput,
    ],
    {
      nullable: true,
    }
  )
  upsert?:
    | SubscriptionOnAccountUpsertWithWhereUniqueWithoutSubscriptionInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => SubscriptionOnAccountCreateManySubscriptionInputEnvelope,
    {
      nullable: true,
    }
  )
  createMany?:
    | SubscriptionOnAccountCreateManySubscriptionInputEnvelope
    | undefined;

  @TypeGraphQL.Field((_type) => [SubscriptionOnAccountWhereUniqueInput], {
    nullable: true,
  })
  connect?: SubscriptionOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [SubscriptionOnAccountWhereUniqueInput], {
    nullable: true,
  })
  set?: SubscriptionOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [SubscriptionOnAccountWhereUniqueInput], {
    nullable: true,
  })
  disconnect?: SubscriptionOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [SubscriptionOnAccountWhereUniqueInput], {
    nullable: true,
  })
  delete?: SubscriptionOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [
      SubscriptionOnAccountUpdateWithWhereUniqueWithoutSubscriptionInput,
    ],
    {
      nullable: true,
    }
  )
  update?:
    | SubscriptionOnAccountUpdateWithWhereUniqueWithoutSubscriptionInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [
      SubscriptionOnAccountUpdateManyWithWhereWithoutSubscriptionInput,
    ],
    {
      nullable: true,
    }
  )
  updateMany?:
    | SubscriptionOnAccountUpdateManyWithWhereWithoutSubscriptionInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => [SubscriptionOnAccountScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: SubscriptionOnAccountScalarWhereInput[] | undefined;
}
