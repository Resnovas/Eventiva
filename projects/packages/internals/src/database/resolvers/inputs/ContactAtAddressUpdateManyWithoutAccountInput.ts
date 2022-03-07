import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ContactAtAddressCreateManyAccountInputEnvelope } from '../inputs/ContactAtAddressCreateManyAccountInputEnvelope';
import { ContactAtAddressCreateOrConnectWithoutAccountInput } from '../inputs/ContactAtAddressCreateOrConnectWithoutAccountInput';
import { ContactAtAddressCreateWithoutAccountInput } from '../inputs/ContactAtAddressCreateWithoutAccountInput';
import { ContactAtAddressScalarWhereInput } from '../inputs/ContactAtAddressScalarWhereInput';
import { ContactAtAddressUpdateManyWithWhereWithoutAccountInput } from '../inputs/ContactAtAddressUpdateManyWithWhereWithoutAccountInput';
import { ContactAtAddressUpdateWithWhereUniqueWithoutAccountInput } from '../inputs/ContactAtAddressUpdateWithWhereUniqueWithoutAccountInput';
import { ContactAtAddressUpsertWithWhereUniqueWithoutAccountInput } from '../inputs/ContactAtAddressUpsertWithWhereUniqueWithoutAccountInput';
import { ContactAtAddressWhereUniqueInput } from '../inputs/ContactAtAddressWhereUniqueInput';

@TypeGraphQL.InputType('ContactAtAddressUpdateManyWithoutAccountInput', {
  isAbstract: true,
})
export class ContactAtAddressUpdateManyWithoutAccountInput {
  @TypeGraphQL.Field((_type) => [ContactAtAddressCreateWithoutAccountInput], {
    nullable: true,
  })
  create?: ContactAtAddressCreateWithoutAccountInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [ContactAtAddressCreateOrConnectWithoutAccountInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?:
    | ContactAtAddressCreateOrConnectWithoutAccountInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [ContactAtAddressUpsertWithWhereUniqueWithoutAccountInput],
    {
      nullable: true,
    }
  )
  upsert?:
    | ContactAtAddressUpsertWithWhereUniqueWithoutAccountInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => ContactAtAddressCreateManyAccountInputEnvelope,
    {
      nullable: true,
    }
  )
  createMany?: ContactAtAddressCreateManyAccountInputEnvelope | undefined;

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
    (_type) => [ContactAtAddressUpdateWithWhereUniqueWithoutAccountInput],
    {
      nullable: true,
    }
  )
  update?:
    | ContactAtAddressUpdateWithWhereUniqueWithoutAccountInput[]
    | undefined;

  @TypeGraphQL.Field(
    (_type) => [ContactAtAddressUpdateManyWithWhereWithoutAccountInput],
    {
      nullable: true,
    }
  )
  updateMany?:
    | ContactAtAddressUpdateManyWithWhereWithoutAccountInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => [ContactAtAddressScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: ContactAtAddressScalarWhereInput[] | undefined;
}
