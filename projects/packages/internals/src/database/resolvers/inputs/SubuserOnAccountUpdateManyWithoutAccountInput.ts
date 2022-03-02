import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SubuserOnAccountCreateManyAccountInputEnvelope } from '../inputs/SubuserOnAccountCreateManyAccountInputEnvelope';
import { SubuserOnAccountCreateOrConnectWithoutAccountInput } from '../inputs/SubuserOnAccountCreateOrConnectWithoutAccountInput';
import { SubuserOnAccountCreateWithoutAccountInput } from '../inputs/SubuserOnAccountCreateWithoutAccountInput';
import { SubuserOnAccountScalarWhereInput } from '../inputs/SubuserOnAccountScalarWhereInput';
import { SubuserOnAccountUpdateManyWithWhereWithoutAccountInput } from '../inputs/SubuserOnAccountUpdateManyWithWhereWithoutAccountInput';
import { SubuserOnAccountUpdateWithWhereUniqueWithoutAccountInput } from '../inputs/SubuserOnAccountUpdateWithWhereUniqueWithoutAccountInput';
import { SubuserOnAccountUpsertWithWhereUniqueWithoutAccountInput } from '../inputs/SubuserOnAccountUpsertWithWhereUniqueWithoutAccountInput';
import { SubuserOnAccountWhereUniqueInput } from '../inputs/SubuserOnAccountWhereUniqueInput';

@TypeGraphQL.InputType('SubuserOnAccountUpdateManyWithoutAccountInput', {
  isAbstract: true,
})
export class SubuserOnAccountUpdateManyWithoutAccountInput {
  @TypeGraphQL.Field((_type) => [SubuserOnAccountCreateWithoutAccountInput], {
    nullable: true,
  })
  create?: SubuserOnAccountCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [SubuserOnAccountCreateOrConnectWithoutAccountInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | SubuserOnAccountCreateOrConnectWithoutAccountInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [SubuserOnAccountUpsertWithWhereUniqueWithoutAccountInput],
    {
      nullable: true,
    }
  )
  upsert?:
    | SubuserOnAccountUpsertWithWhereUniqueWithoutAccountInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => SubuserOnAccountCreateManyAccountInputEnvelope,
    {
      nullable: true,
    }
  )
  createMany?: SubuserOnAccountCreateManyAccountInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [SubuserOnAccountWhereUniqueInput], {
    nullable: true,
  })
  connect?: SubuserOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [SubuserOnAccountWhereUniqueInput], {
    nullable: true,
  })
  set?: SubuserOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [SubuserOnAccountWhereUniqueInput], {
    nullable: true,
  })
  disconnect?: SubuserOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [SubuserOnAccountWhereUniqueInput], {
    nullable: true,
  })
  delete?: SubuserOnAccountWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [SubuserOnAccountUpdateWithWhereUniqueWithoutAccountInput],
    {
      nullable: true,
    }
  )
  update?:
    | SubuserOnAccountUpdateWithWhereUniqueWithoutAccountInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [SubuserOnAccountUpdateManyWithWhereWithoutAccountInput],
    {
      nullable: true,
    }
  )
  updateMany?:
    | SubuserOnAccountUpdateManyWithWhereWithoutAccountInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => [SubuserOnAccountScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: SubuserOnAccountScalarWhereInput[] | undefined;
}
