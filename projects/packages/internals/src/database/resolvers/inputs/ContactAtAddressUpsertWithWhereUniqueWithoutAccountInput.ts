import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ContactAtAddressCreateWithoutAccountInput } from '../inputs/ContactAtAddressCreateWithoutAccountInput';
import { ContactAtAddressUpdateWithoutAccountInput } from '../inputs/ContactAtAddressUpdateWithoutAccountInput';
import { ContactAtAddressWhereUniqueInput } from '../inputs/ContactAtAddressWhereUniqueInput';

@TypeGraphQL.InputType(
  'ContactAtAddressUpsertWithWhereUniqueWithoutAccountInput',
  {
    isAbstract: true,
  }
)
export class ContactAtAddressUpsertWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field((_type) => ContactAtAddressWhereUniqueInput, {
    nullable: false,
  })
  where!: ContactAtAddressWhereUniqueInput;

  @TypeGraphQL.Field((_type) => ContactAtAddressUpdateWithoutAccountInput, {
    nullable: false,
  })
  update!: ContactAtAddressUpdateWithoutAccountInput;

  @TypeGraphQL.Field((_type) => ContactAtAddressCreateWithoutAccountInput, {
    nullable: false,
  })
  create!: ContactAtAddressCreateWithoutAccountInput;
}
