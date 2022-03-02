import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AddressCreateWithoutFeaturesOfBuisnessInput } from '../inputs/AddressCreateWithoutFeaturesOfBuisnessInput';
import { AddressUpdateWithoutFeaturesOfBuisnessInput } from '../inputs/AddressUpdateWithoutFeaturesOfBuisnessInput';

@TypeGraphQL.InputType('AddressUpsertWithoutFeaturesOfBuisnessInput', {
  isAbstract: true,
})
export class AddressUpsertWithoutFeaturesOfBuisnessInput {
  @TypeGraphQL.Field((_type) => AddressUpdateWithoutFeaturesOfBuisnessInput, {
    nullable: false,
  })
  update!: AddressUpdateWithoutFeaturesOfBuisnessInput;

  @TypeGraphQL.Field((_type) => AddressCreateWithoutFeaturesOfBuisnessInput, {
    nullable: false,
  })
  create!: AddressCreateWithoutFeaturesOfBuisnessInput;
}
