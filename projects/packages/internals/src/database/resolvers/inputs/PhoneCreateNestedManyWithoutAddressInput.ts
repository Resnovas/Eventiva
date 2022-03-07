import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { PhoneCreateManyAddressInputEnvelope } from '../inputs/PhoneCreateManyAddressInputEnvelope';
import { PhoneCreateOrConnectWithoutAddressInput } from '../inputs/PhoneCreateOrConnectWithoutAddressInput';
import { PhoneCreateWithoutAddressInput } from '../inputs/PhoneCreateWithoutAddressInput';
import { PhoneWhereUniqueInput } from '../inputs/PhoneWhereUniqueInput';

@TypeGraphQL.InputType('PhoneCreateNestedManyWithoutAddressInput', {
  isAbstract: true,
})
export class PhoneCreateNestedManyWithoutAddressInput {
  @TypeGraphQL.Field((_type) => [PhoneCreateWithoutAddressInput], {
    nullable: true,
  })
  create?: PhoneCreateWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field((_type) => [PhoneCreateOrConnectWithoutAddressInput], {
    nullable: true,
  })
  connectOrCreate?: PhoneCreateOrConnectWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field((_type) => PhoneCreateManyAddressInputEnvelope, {
    nullable: true,
  })
  createMany?: PhoneCreateManyAddressInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [PhoneWhereUniqueInput], {
    nullable: true,
  })
  connect?: PhoneWhereUniqueInput[] | undefined;
}
