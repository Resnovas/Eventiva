import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { TransactionCreateManyAccountInputEnvelope } from '../inputs/TransactionCreateManyAccountInputEnvelope';
import { TransactionCreateOrConnectWithoutAccountInput } from '../inputs/TransactionCreateOrConnectWithoutAccountInput';
import { TransactionCreateWithoutAccountInput } from '../inputs/TransactionCreateWithoutAccountInput';
import { TransactionScalarWhereInput } from '../inputs/TransactionScalarWhereInput';
import { TransactionUpdateManyWithWhereWithoutAccountInput } from '../inputs/TransactionUpdateManyWithWhereWithoutAccountInput';
import { TransactionUpdateWithWhereUniqueWithoutAccountInput } from '../inputs/TransactionUpdateWithWhereUniqueWithoutAccountInput';
import { TransactionUpsertWithWhereUniqueWithoutAccountInput } from '../inputs/TransactionUpsertWithWhereUniqueWithoutAccountInput';
import { TransactionWhereUniqueInput } from '../inputs/TransactionWhereUniqueInput';

@TypeGraphQL.InputType('TransactionUpdateManyWithoutAccountInput', {
  isAbstract: true,
})
export class TransactionUpdateManyWithoutAccountInput {
  @TypeGraphQL.Field((_type) => [TransactionCreateWithoutAccountInput], {
    nullable: true,
  })
  create?: TransactionCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [TransactionCreateOrConnectWithoutAccountInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?: TransactionCreateOrConnectWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [TransactionUpsertWithWhereUniqueWithoutAccountInput],
    {
      nullable: true,
    }
  )
  upsert?: TransactionUpsertWithWhereUniqueWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field((_type) => TransactionCreateManyAccountInputEnvelope, {
    nullable: true,
  })
  createMany?: TransactionCreateManyAccountInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [TransactionWhereUniqueInput], {
    nullable: true,
  })
  connect?: TransactionWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [TransactionWhereUniqueInput], {
    nullable: true,
  })
  set?: TransactionWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [TransactionWhereUniqueInput], {
    nullable: true,
  })
  disconnect?: TransactionWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [TransactionWhereUniqueInput], {
    nullable: true,
  })
  delete?: TransactionWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [TransactionUpdateWithWhereUniqueWithoutAccountInput],
    {
      nullable: true,
    }
  )
  update?: TransactionUpdateWithWhereUniqueWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [TransactionUpdateManyWithWhereWithoutAccountInput],
    {
      nullable: true,
    }
  )
  updateMany?: TransactionUpdateManyWithWhereWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field((_type) => [TransactionScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: TransactionScalarWhereInput[] | undefined;
}
