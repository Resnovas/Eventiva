import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AddressCreateOrConnectWithoutContactsInput } from '../inputs/AddressCreateOrConnectWithoutContactsInput';
import { AddressCreateWithoutContactsInput } from '../inputs/AddressCreateWithoutContactsInput';
import { AddressWhereUniqueInput } from '../inputs/AddressWhereUniqueInput';

@TypeGraphQL.InputType('AddressCreateNestedOneWithoutContactsInput', {
  isAbstract: true,
})
export class AddressCreateNestedOneWithoutContactsInput {
  @TypeGraphQL.Field((_type) => AddressCreateWithoutContactsInput, {
    nullable: true,
  })
  create?: AddressCreateWithoutContactsInput | undefined;

  @TypeGraphQL.Field((_type) => AddressCreateOrConnectWithoutContactsInput, {
    nullable: true,
  })
  connectOrCreate?: AddressCreateOrConnectWithoutContactsInput | undefined;

  @TypeGraphQL.Field((_type) => AddressWhereUniqueInput, {
    nullable: true,
  })
  connect?: AddressWhereUniqueInput | undefined;
}
