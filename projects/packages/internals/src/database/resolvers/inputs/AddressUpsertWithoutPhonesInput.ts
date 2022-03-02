import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AddressCreateWithoutPhonesInput } from '../inputs/AddressCreateWithoutPhonesInput';
import { AddressUpdateWithoutPhonesInput } from '../inputs/AddressUpdateWithoutPhonesInput';

@TypeGraphQL.InputType('AddressUpsertWithoutPhonesInput', {
  isAbstract: true,
})
export class AddressUpsertWithoutPhonesInput {
  @TypeGraphQL.Field((_type) => AddressUpdateWithoutPhonesInput, {
    nullable: false,
  })
  update!: AddressUpdateWithoutPhonesInput;

  @TypeGraphQL.Field((_type) => AddressCreateWithoutPhonesInput, {
    nullable: false,
  })
  create!: AddressCreateWithoutPhonesInput;
}
