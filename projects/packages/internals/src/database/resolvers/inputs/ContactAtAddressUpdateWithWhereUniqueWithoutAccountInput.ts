import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ContactAtAddressUpdateWithoutAccountInput } from '../inputs/ContactAtAddressUpdateWithoutAccountInput';
import { ContactAtAddressWhereUniqueInput } from '../inputs/ContactAtAddressWhereUniqueInput';

@TypeGraphQL.InputType(
  'ContactAtAddressUpdateWithWhereUniqueWithoutAccountInput',
  {
    isAbstract: true,
  }
)
export class ContactAtAddressUpdateWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field((_type) => ContactAtAddressWhereUniqueInput, {
    nullable: false,
  })
  where!: ContactAtAddressWhereUniqueInput;

  @TypeGraphQL.Field((_type) => ContactAtAddressUpdateWithoutAccountInput, {
    nullable: false,
  })
  data!: ContactAtAddressUpdateWithoutAccountInput;
}
