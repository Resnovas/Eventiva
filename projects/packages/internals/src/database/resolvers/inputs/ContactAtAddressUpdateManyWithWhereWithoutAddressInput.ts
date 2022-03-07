import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ContactAtAddressScalarWhereInput } from '../inputs/ContactAtAddressScalarWhereInput';
import { ContactAtAddressUpdateManyMutationInput } from '../inputs/ContactAtAddressUpdateManyMutationInput';

@TypeGraphQL.InputType(
  'ContactAtAddressUpdateManyWithWhereWithoutAddressInput',
  {
    isAbstract: true,
  }
)
export class ContactAtAddressUpdateManyWithWhereWithoutAddressInput {
  @TypeGraphQL.Field((_type) => ContactAtAddressScalarWhereInput, {
    nullable: false,
  })
  where!: ContactAtAddressScalarWhereInput;

  @TypeGraphQL.Field((_type) => ContactAtAddressUpdateManyMutationInput, {
    nullable: false,
  })
  data!: ContactAtAddressUpdateManyMutationInput;
}
