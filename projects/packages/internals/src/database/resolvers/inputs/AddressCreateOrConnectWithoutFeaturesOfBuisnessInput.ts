import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AddressCreateWithoutFeaturesOfBuisnessInput } from '../inputs/AddressCreateWithoutFeaturesOfBuisnessInput';
import { AddressWhereUniqueInput } from '../inputs/AddressWhereUniqueInput';

@TypeGraphQL.InputType('AddressCreateOrConnectWithoutFeaturesOfBuisnessInput', {
  isAbstract: true,
})
export class AddressCreateOrConnectWithoutFeaturesOfBuisnessInput {
  @TypeGraphQL.Field((_type) => AddressWhereUniqueInput, {
    nullable: false,
  })
  where!: AddressWhereUniqueInput;

  @TypeGraphQL.Field((_type) => AddressCreateWithoutFeaturesOfBuisnessInput, {
    nullable: false,
  })
  create!: AddressCreateWithoutFeaturesOfBuisnessInput;
}
