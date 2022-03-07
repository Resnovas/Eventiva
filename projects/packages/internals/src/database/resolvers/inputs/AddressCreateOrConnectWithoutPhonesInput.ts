import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AddressCreateWithoutPhonesInput } from '../inputs/AddressCreateWithoutPhonesInput';
import { AddressWhereUniqueInput } from '../inputs/AddressWhereUniqueInput';

@TypeGraphQL.InputType('AddressCreateOrConnectWithoutPhonesInput', {
  isAbstract: true,
})
export class AddressCreateOrConnectWithoutPhonesInput {
  @TypeGraphQL.Field((_type) => AddressWhereUniqueInput, {
    nullable: false,
  })
  where!: AddressWhereUniqueInput;

  @TypeGraphQL.Field((_type) => AddressCreateWithoutPhonesInput, {
    nullable: false,
  })
  create!: AddressCreateWithoutPhonesInput;
}
