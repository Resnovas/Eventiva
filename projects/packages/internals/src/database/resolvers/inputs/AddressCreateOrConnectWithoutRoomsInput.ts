import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AddressCreateWithoutRoomsInput } from '../inputs/AddressCreateWithoutRoomsInput';
import { AddressWhereUniqueInput } from '../inputs/AddressWhereUniqueInput';

@TypeGraphQL.InputType('AddressCreateOrConnectWithoutRoomsInput', {
  isAbstract: true,
})
export class AddressCreateOrConnectWithoutRoomsInput {
  @TypeGraphQL.Field((_type) => AddressWhereUniqueInput, {
    nullable: false,
  })
  where!: AddressWhereUniqueInput;

  @TypeGraphQL.Field((_type) => AddressCreateWithoutRoomsInput, {
    nullable: false,
  })
  create!: AddressCreateWithoutRoomsInput;
}