import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ContactAtAddressCreateManyAddressInputEnvelope } from '../inputs/ContactAtAddressCreateManyAddressInputEnvelope';
import { ContactAtAddressCreateOrConnectWithoutAddressInput } from '../inputs/ContactAtAddressCreateOrConnectWithoutAddressInput';
import { ContactAtAddressCreateWithoutAddressInput } from '../inputs/ContactAtAddressCreateWithoutAddressInput';
import { ContactAtAddressScalarWhereInput } from '../inputs/ContactAtAddressScalarWhereInput';
import { ContactAtAddressUpdateManyWithWhereWithoutAddressInput } from '../inputs/ContactAtAddressUpdateManyWithWhereWithoutAddressInput';
import { ContactAtAddressUpdateWithWhereUniqueWithoutAddressInput } from '../inputs/ContactAtAddressUpdateWithWhereUniqueWithoutAddressInput';
import { ContactAtAddressUpsertWithWhereUniqueWithoutAddressInput } from '../inputs/ContactAtAddressUpsertWithWhereUniqueWithoutAddressInput';
import { ContactAtAddressWhereUniqueInput } from '../inputs/ContactAtAddressWhereUniqueInput';

@TypeGraphQL.InputType('ContactAtAddressUpdateManyWithoutAddressInput', {
  isAbstract: true,
})
export class ContactAtAddressUpdateManyWithoutAddressInput {
  @TypeGraphQL.Field((_type) => [ContactAtAddressCreateWithoutAddressInput], {
    nullable: true,
  })
  create?: ContactAtAddressCreateWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [ContactAtAddressCreateOrConnectWithoutAddressInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | ContactAtAddressCreateOrConnectWithoutAddressInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [ContactAtAddressUpsertWithWhereUniqueWithoutAddressInput],
    {
      nullable: true,
    }
  )
  upsert?:
    | ContactAtAddressUpsertWithWhereUniqueWithoutAddressInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => ContactAtAddressCreateManyAddressInputEnvelope,
    {
      nullable: true,
    }
  )
  createMany?: ContactAtAddressCreateManyAddressInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [ContactAtAddressWhereUniqueInput], {
    nullable: true,
  })
  connect?: ContactAtAddressWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [ContactAtAddressWhereUniqueInput], {
    nullable: true,
  })
  set?: ContactAtAddressWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [ContactAtAddressWhereUniqueInput], {
    nullable: true,
  })
  disconnect?: ContactAtAddressWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [ContactAtAddressWhereUniqueInput], {
    nullable: true,
  })
  delete?: ContactAtAddressWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [ContactAtAddressUpdateWithWhereUniqueWithoutAddressInput],
    {
      nullable: true,
    }
  )
  update?:
    | ContactAtAddressUpdateWithWhereUniqueWithoutAddressInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [ContactAtAddressUpdateManyWithWhereWithoutAddressInput],
    {
      nullable: true,
    }
  )
  updateMany?:
    | ContactAtAddressUpdateManyWithWhereWithoutAddressInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => [ContactAtAddressScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: ContactAtAddressScalarWhereInput[] | undefined;
}
