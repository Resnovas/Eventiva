import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AddressCreateWithoutPrimaryAccountInput } from '../inputs/AddressCreateWithoutPrimaryAccountInput';
import { AddressUpdateWithoutPrimaryAccountInput } from '../inputs/AddressUpdateWithoutPrimaryAccountInput';

@TypeGraphQL.InputType('AddressUpsertWithoutPrimaryAccountInput', {
  isAbstract: true,
})
export class AddressUpsertWithoutPrimaryAccountInput {
  @TypeGraphQL.Field((_type) => AddressUpdateWithoutPrimaryAccountInput, {
    nullable: false,
  })
  update!: AddressUpdateWithoutPrimaryAccountInput;

  @TypeGraphQL.Field((_type) => AddressCreateWithoutPrimaryAccountInput, {
    nullable: false,
  })
  create!: AddressCreateWithoutPrimaryAccountInput;
}
