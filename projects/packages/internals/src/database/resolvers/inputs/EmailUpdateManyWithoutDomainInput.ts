import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmailCreateManyDomainInputEnvelope } from '../inputs/EmailCreateManyDomainInputEnvelope';
import { EmailCreateOrConnectWithoutDomainInput } from '../inputs/EmailCreateOrConnectWithoutDomainInput';
import { EmailCreateWithoutDomainInput } from '../inputs/EmailCreateWithoutDomainInput';
import { EmailScalarWhereInput } from '../inputs/EmailScalarWhereInput';
import { EmailUpdateManyWithWhereWithoutDomainInput } from '../inputs/EmailUpdateManyWithWhereWithoutDomainInput';
import { EmailUpdateWithWhereUniqueWithoutDomainInput } from '../inputs/EmailUpdateWithWhereUniqueWithoutDomainInput';
import { EmailUpsertWithWhereUniqueWithoutDomainInput } from '../inputs/EmailUpsertWithWhereUniqueWithoutDomainInput';
import { EmailWhereUniqueInput } from '../inputs/EmailWhereUniqueInput';

@TypeGraphQL.InputType('EmailUpdateManyWithoutDomainInput', {
  isAbstract: true,
})
export class EmailUpdateManyWithoutDomainInput {
  @TypeGraphQL.Field((_type) => [EmailCreateWithoutDomainInput], {
    nullable: true,
  })
  create?: EmailCreateWithoutDomainInput[] | undefined;

  @TypeGraphQL.Field((_type) => [EmailCreateOrConnectWithoutDomainInput], {
    nullable: true,
  })
  connectOrCreate?: EmailCreateOrConnectWithoutDomainInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [EmailUpsertWithWhereUniqueWithoutDomainInput],
    {
      nullable: true,
    }
  )
  upsert?: EmailUpsertWithWhereUniqueWithoutDomainInput[] | undefined;

  @TypeGraphQL.Field((_type) => EmailCreateManyDomainInputEnvelope, {
    nullable: true,
  })
  createMany?: EmailCreateManyDomainInputEnvelope | undefined;

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
    (_type) => [EmailUpdateWithWhereUniqueWithoutDomainInput],
    {
      nullable: true,
    }
  )
  update?: EmailUpdateWithWhereUniqueWithoutDomainInput[] | undefined;

  @TypeGraphQL.Field((_type) => [EmailUpdateManyWithWhereWithoutDomainInput], {
    nullable: true,
  })
  updateMany?: EmailUpdateManyWithWhereWithoutDomainInput[] | undefined;

  @TypeGraphQL.Field((_type) => [EmailScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: EmailScalarWhereInput[] | undefined;
}
