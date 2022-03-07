import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateOrConnectWithoutFilesInput } from '../inputs/AccountCreateOrConnectWithoutFilesInput';
import { AccountCreateWithoutFilesInput } from '../inputs/AccountCreateWithoutFilesInput';
import { AccountScalarWhereInput } from '../inputs/AccountScalarWhereInput';
import { AccountUpdateManyWithWhereWithoutFilesInput } from '../inputs/AccountUpdateManyWithWhereWithoutFilesInput';
import { AccountUpdateWithWhereUniqueWithoutFilesInput } from '../inputs/AccountUpdateWithWhereUniqueWithoutFilesInput';
import { AccountUpsertWithWhereUniqueWithoutFilesInput } from '../inputs/AccountUpsertWithWhereUniqueWithoutFilesInput';
import { AccountWhereUniqueInput } from '../inputs/AccountWhereUniqueInput';

@TypeGraphQL.InputType('AccountUpdateManyWithoutFilesInput', {
  isAbstract: true,
})
export class AccountUpdateManyWithoutFilesInput {
  @TypeGraphQL.Field((_type) => [AccountCreateWithoutFilesInput], {
    nullable: true,
  })
  create?: AccountCreateWithoutFilesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [AccountCreateOrConnectWithoutFilesInput], {
    nullable: true,
  })
  connectOrCreate?: AccountCreateOrConnectWithoutFilesInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [AccountUpsertWithWhereUniqueWithoutFilesInput],
    {
      nullable: true,
    }
  )
  upsert?: AccountUpsertWithWhereUniqueWithoutFilesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [AccountWhereUniqueInput], {
    nullable: true,
  })
  connect?: AccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [AccountWhereUniqueInput], {
    nullable: true,
  })
  set?: AccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [AccountWhereUniqueInput], {
    nullable: true,
  })
  disconnect?: AccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [AccountWhereUniqueInput], {
    nullable: true,
  })
  delete?: AccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [AccountUpdateWithWhereUniqueWithoutFilesInput],
    {
      nullable: true,
    }
  )
  update?: AccountUpdateWithWhereUniqueWithoutFilesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [AccountUpdateManyWithWhereWithoutFilesInput], {
    nullable: true,
  })
  updateMany?: AccountUpdateManyWithWhereWithoutFilesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [AccountScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: AccountScalarWhereInput[] | undefined;
}
