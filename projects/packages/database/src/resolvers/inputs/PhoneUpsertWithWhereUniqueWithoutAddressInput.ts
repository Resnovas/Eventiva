import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { PhoneCreateWithoutAddressInput } from '../inputs/PhoneCreateWithoutAddressInput';
import { PhoneUpdateWithoutAddressInput } from '../inputs/PhoneUpdateWithoutAddressInput';
import { PhoneWhereUniqueInput } from '../inputs/PhoneWhereUniqueInput';

@TypeGraphQL.InputType('PhoneUpsertWithWhereUniqueWithoutAddressInput', {
  isAbstract: true,
})
export class PhoneUpsertWithWhereUniqueWithoutAddressInput {
  @TypeGraphQL.Field((_type) => PhoneWhereUniqueInput, {
    nullable: false,
  })
  where!: PhoneWhereUniqueInput;

  @TypeGraphQL.Field((_type) => PhoneUpdateWithoutAddressInput, {
    nullable: false,
  })
  update!: PhoneUpdateWithoutAddressInput;

  @TypeGraphQL.Field((_type) => PhoneCreateWithoutAddressInput, {
    nullable: false,
  })
  create!: PhoneCreateWithoutAddressInput;
}
