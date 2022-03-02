import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ContactAtAddressUpdateWithoutAddressInput } from '../inputs/ContactAtAddressUpdateWithoutAddressInput';
import { ContactAtAddressWhereUniqueInput } from '../inputs/ContactAtAddressWhereUniqueInput';

@TypeGraphQL.InputType(
  'ContactAtAddressUpdateWithWhereUniqueWithoutAddressInput',
  {
    isAbstract: true,
  }
)
export class ContactAtAddressUpdateWithWhereUniqueWithoutAddressInput {
  @TypeGraphQL.Field((_type) => ContactAtAddressWhereUniqueInput, {
    nullable: false,
  })
  where!: ContactAtAddressWhereUniqueInput;

  @TypeGraphQL.Field((_type) => ContactAtAddressUpdateWithoutAddressInput, {
    nullable: false,
  })
  data!: ContactAtAddressUpdateWithoutAddressInput;
}
