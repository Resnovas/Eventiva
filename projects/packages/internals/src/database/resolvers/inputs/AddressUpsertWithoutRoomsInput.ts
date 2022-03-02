import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AddressCreateWithoutRoomsInput } from '../inputs/AddressCreateWithoutRoomsInput';
import { AddressUpdateWithoutRoomsInput } from '../inputs/AddressUpdateWithoutRoomsInput';

@TypeGraphQL.InputType('AddressUpsertWithoutRoomsInput', {
  isAbstract: true,
})
export class AddressUpsertWithoutRoomsInput {
  @TypeGraphQL.Field((_type) => AddressUpdateWithoutRoomsInput, {
    nullable: false,
  })
  update!: AddressUpdateWithoutRoomsInput;

  @TypeGraphQL.Field((_type) => AddressCreateWithoutRoomsInput, {
    nullable: false,
  })
  create!: AddressCreateWithoutRoomsInput;
}
