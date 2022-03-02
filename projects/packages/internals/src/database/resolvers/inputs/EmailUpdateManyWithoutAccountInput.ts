import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmailCreateManyAccountInputEnvelope } from '../inputs/EmailCreateManyAccountInputEnvelope';
import { EmailCreateOrConnectWithoutAccountInput } from '../inputs/EmailCreateOrConnectWithoutAccountInput';
import { EmailCreateWithoutAccountInput } from '../inputs/EmailCreateWithoutAccountInput';
import { EmailScalarWhereInput } from '../inputs/EmailScalarWhereInput';
import { EmailUpdateManyWithWhereWithoutAccountInput } from '../inputs/EmailUpdateManyWithWhereWithoutAccountInput';
import { EmailUpdateWithWhereUniqueWithoutAccountInput } from '../inputs/EmailUpdateWithWhereUniqueWithoutAccountInput';
import { EmailUpsertWithWhereUniqueWithoutAccountInput } from '../inputs/EmailUpsertWithWhereUniqueWithoutAccountInput';
import { EmailWhereUniqueInput } from '../inputs/EmailWhereUniqueInput';

@TypeGraphQL.InputType('EmailUpdateManyWithoutAccountInput', {
  isAbstract: true,
})
export class EmailUpdateManyWithoutAccountInput {
  @TypeGraphQL.Field((_type) => [EmailCreateWithoutAccountInput], {
    nullable: true,
  })
  create?: EmailCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field((_type) => [EmailCreateOrConnectWithoutAccountInput], {
    nullable: true,
  })
  connectOrCreate?: EmailCreateOrConnectWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [EmailUpsertWithWhereUniqueWithoutAccountInput],
    {
      nullable: true,
    }
  )
  upsert?: EmailUpsertWithWhereUniqueWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field((_type) => EmailCreateManyAccountInputEnvelope, {
    nullable: true,
  })
  createMany?: EmailCreateManyAccountInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [EmailWhereUniqueInput], {
    nullable: true,
  })
  connect?: EmailWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [EmailWhereUniqueInput], {
    nullable: true,
  })
  set?: EmailWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [EmailWhereUniqueInput], {
    nullable: true,
  })
  disconnect?: EmailWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [EmailWhereUniqueInput], {
    nullable: true,
  })
  delete?: EmailWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [EmailUpdateWithWhereUniqueWithoutAccountInput],
    {
      nullable: true,
    }
  )
  update?: EmailUpdateWithWhereUniqueWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field((_type) => [EmailUpdateManyWithWhereWithoutAccountInput], {
    nullable: true,
  })
  updateMany?: EmailUpdateManyWithWhereWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field((_type) => [EmailScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: EmailScalarWhereInput[] | undefined;
}
