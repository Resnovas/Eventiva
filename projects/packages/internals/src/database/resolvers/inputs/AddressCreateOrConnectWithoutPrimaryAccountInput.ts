import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AddressCreateWithoutPrimaryAccountInput } from '../inputs/AddressCreateWithoutPrimaryAccountInput';
import { AddressWhereUniqueInput } from '../inputs/AddressWhereUniqueInput';

@TypeGraphQL.InputType('AddressCreateOrConnectWithoutPrimaryAccountInput', {
  isAbstract: true,
})
export class AddressCreateOrConnectWithoutPrimaryAccountInput {
  @TypeGraphQL.Field((_type) => AddressWhereUniqueInput, {
    nullable: false,
  })
  where!: AddressWhereUniqueInput;

  @TypeGraphQL.Field((_type) => AddressCreateWithoutPrimaryAccountInput, {
    nullable: false,
  })
  create!: AddressCreateWithoutPrimaryAccountInput;
}
